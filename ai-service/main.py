"""
Carphatian AI Microservice

FastAPI application for AI-powered features:
- Job description generation
- Cover letter generation  
- Vector embeddings for semantic search
- Multi-provider support with fallback

Built by Carphatian
"""

from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import structlog
import sentry_sdk

from config import get_settings
from cache import get_cache, AICache
from providers import (
    get_ai_factory,
    AIProviderFactory,
    Message,
    CompletionRequest,
    EmbeddingRequest,
)

# Initialize logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()
settings = get_settings()

# Initialize Sentry if configured
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
    )


# ============================================================================
# Request/Response Models
# ============================================================================

class JobDraftRequest(BaseModel):
    """Request for AI-generated job description."""
    title: str = Field(..., min_length=5, max_length=200, description="Job title")
    category: str = Field(..., description="Job category (e.g., Web Development)")
    skills: List[str] = Field(..., min_items=1, description="Required skills")
    budget_min: Optional[int] = Field(None, ge=0, description="Minimum budget")
    budget_max: Optional[int] = Field(None, ge=0, description="Maximum budget")
    timeline: Optional[str] = Field(None, description="Project timeline")
    additional_context: Optional[str] = Field(None, max_length=1000, description="Additional context")
    provider: Optional[str] = Field(None, description="Preferred AI provider")


class JobDraftResponse(BaseModel):
    """AI-generated job description."""
    description: str
    requirements: List[str]
    nice_to_have: List[str]
    model: str
    provider: str
    cached: bool = False


class CoverLetterRequest(BaseModel):
    """Request for AI-generated cover letter."""
    job_title: str = Field(..., description="Job title applying for")
    job_description: str = Field(..., max_length=5000, description="Job description")
    freelancer_name: str = Field(..., description="Freelancer's name")
    freelancer_skills: List[str] = Field(..., description="Freelancer's skills")
    freelancer_experience: Optional[str] = Field(None, max_length=2000, description="Relevant experience")
    provider: Optional[str] = Field(None, description="Preferred AI provider")


class CoverLetterResponse(BaseModel):
    """AI-generated cover letter."""
    cover_letter: str
    highlights: List[str]
    model: str
    provider: str
    cached: bool = False


class EmbedRequest(BaseModel):
    """Request for text embedding."""
    text: str = Field(..., min_length=1, max_length=10000, description="Text to embed")
    model: Optional[str] = Field(None, description="Embedding model to use")


class EmbedResponse(BaseModel):
    """Text embedding response."""
    embedding: List[float]
    dimensions: int
    model: str
    cached: bool = False


class SemanticSearchRequest(BaseModel):
    """Request for semantic search."""
    query: str = Field(..., min_length=3, max_length=500, description="Search query")
    embeddings: List[List[float]] = Field(..., description="Embeddings to search against")
    top_k: int = Field(default=10, ge=1, le=100, description="Number of results")


class SemanticSearchResult(BaseModel):
    """Single search result."""
    index: int
    score: float


class SemanticSearchResponse(BaseModel):
    """Semantic search response."""
    results: List[SemanticSearchResult]
    query_embedding: List[float]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    providers: dict
    cache_connected: bool


# ============================================================================
# Lifespan Management
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown."""
    # Startup
    logger.info("ai_service_starting", version=settings.app_version)
    
    # Initialize cache
    cache = await get_cache()
    
    # Initialize AI providers
    factory = get_ai_factory()
    
    logger.info(
        "ai_service_started",
        providers=factory.list_providers(),
        cache_connected=cache._client is not None
    )
    
    yield
    
    # Shutdown
    logger.info("ai_service_stopping")
    if cache._client:
        await cache.disconnect()
    logger.info("ai_service_stopped")


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered features for Carphatian Marketplace",
    lifespan=lifespan,
)

# CORS middleware
origins = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Dependencies
# ============================================================================

async def get_factory() -> AIProviderFactory:
    """Dependency to get AI factory."""
    return get_ai_factory()


async def get_ai_cache() -> AICache:
    """Dependency to get cache."""
    return await get_cache()


# ============================================================================
# Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check(
    factory: AIProviderFactory = Depends(get_factory),
    cache: AICache = Depends(get_ai_cache),
):
    """Check service health and provider status."""
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        providers=factory.list_providers(),
        cache_connected=cache._client is not None,
    )


@app.post("/ai/job-draft", response_model=JobDraftResponse, tags=["AI Generation"])
async def generate_job_draft(
    request: JobDraftRequest,
    factory: AIProviderFactory = Depends(get_factory),
    cache: AICache = Depends(get_ai_cache),
):
    """
    Generate a professional job description using AI.
    
    Provides:
    - Full job description
    - Requirements list
    - Nice-to-have skills
    """
    # Check cache
    cache_data = {
        "type": "job_draft",
        "title": request.title,
        "category": request.category,
        "skills": sorted(request.skills),
    }
    
    cached = await cache.get("job_draft", cache_data)
    if cached:
        return JobDraftResponse(**cached, cached=True)
    
    # Build prompt
    budget_info = ""
    if request.budget_min and request.budget_max:
        budget_info = f"Budget: ${request.budget_min} - ${request.budget_max}"
    elif request.budget_max:
        budget_info = f"Budget: Up to ${request.budget_max}"
    
    prompt = f"""You are a professional job posting writer. Create a compelling job posting for a freelance marketplace.

Job Details:
- Title: {request.title}
- Category: {request.category}
- Required Skills: {', '.join(request.skills)}
{f'- {budget_info}' if budget_info else ''}
{f'- Timeline: {request.timeline}' if request.timeline else ''}
{f'- Additional Context: {request.additional_context}' if request.additional_context else ''}

Generate a response in this exact JSON format:
{{
    "description": "A compelling 2-3 paragraph job description that attracts top talent",
    "requirements": ["requirement 1", "requirement 2", "requirement 3", "..."],
    "nice_to_have": ["nice to have 1", "nice to have 2", "..."]
}}

Make the description engaging, professional, and specific. Include what the freelancer will accomplish.
Requirements should be essential skills/experience. Nice-to-have are bonus qualifications."""

    try:
        completion_request = CompletionRequest(
            messages=[Message(role="user", content=prompt)],
            max_tokens=1500,
            temperature=0.7,
        )
        
        response = await factory.complete(completion_request, request.provider)
        
        # Parse JSON response
        import json
        try:
            # Try to extract JSON from response
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            data = json.loads(content.strip())
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            data = {
                "description": response.content,
                "requirements": request.skills,
                "nice_to_have": [],
            }
        
        result = {
            "description": data.get("description", response.content),
            "requirements": data.get("requirements", request.skills),
            "nice_to_have": data.get("nice_to_have", []),
            "model": response.model,
            "provider": response.provider,
        }
        
        # Cache the result
        await cache.set("job_draft", cache_data, result)
        
        return JobDraftResponse(**result, cached=False)
        
    except Exception as e:
        logger.error("job_draft_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service unavailable: {str(e)}"
        )


@app.post("/ai/cover-letter", response_model=CoverLetterResponse, tags=["AI Generation"])
async def generate_cover_letter(
    request: CoverLetterRequest,
    factory: AIProviderFactory = Depends(get_factory),
    cache: AICache = Depends(get_ai_cache),
):
    """
    Generate a personalized cover letter for a job application.
    
    Tailored to the specific job and freelancer's skills.
    """
    # Check cache
    cache_data = {
        "type": "cover_letter",
        "job_title": request.job_title,
        "skills": sorted(request.freelancer_skills),
    }
    
    cached = await cache.get("cover_letter", cache_data)
    if cached:
        return CoverLetterResponse(**cached, cached=True)
    
    prompt = f"""You are an expert career coach helping freelancers write compelling cover letters.

Write a cover letter for the following application:

**Freelancer:** {request.freelancer_name}
**Skills:** {', '.join(request.freelancer_skills)}
{f'**Relevant Experience:** {request.freelancer_experience}' if request.freelancer_experience else ''}

**Applying For:** {request.job_title}
**Job Description:**
{request.job_description[:2000]}

Generate a response in this exact JSON format:
{{
    "cover_letter": "A professional, personalized cover letter (3-4 paragraphs)",
    "highlights": ["key selling point 1", "key selling point 2", "key selling point 3"]
}}

Make the cover letter:
- Personal and engaging (not generic)
- Highlight specific skills matching the job
- Show enthusiasm for the project
- Be concise but impactful
- End with a call to action"""

    try:
        completion_request = CompletionRequest(
            messages=[Message(role="user", content=prompt)],
            max_tokens=1500,
            temperature=0.7,
        )
        
        response = await factory.complete(completion_request, request.provider)
        
        # Parse JSON response
        import json
        try:
            content = response.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            data = json.loads(content.strip())
        except json.JSONDecodeError:
            data = {
                "cover_letter": response.content,
                "highlights": request.freelancer_skills[:3],
            }
        
        result = {
            "cover_letter": data.get("cover_letter", response.content),
            "highlights": data.get("highlights", []),
            "model": response.model,
            "provider": response.provider,
        }
        
        # Cache the result
        await cache.set("cover_letter", cache_data, result)
        
        return CoverLetterResponse(**result, cached=False)
        
    except Exception as e:
        logger.error("cover_letter_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service unavailable: {str(e)}"
        )


@app.post("/ai/embed", response_model=EmbedResponse, tags=["Embeddings"])
async def create_embedding(
    request: EmbedRequest,
    factory: AIProviderFactory = Depends(get_factory),
    cache: AICache = Depends(get_ai_cache),
):
    """
    Create a vector embedding for text.
    
    Used for semantic search and similarity matching.
    Currently uses OpenAI's text-embedding-3-small model.
    """
    # Check cache
    cache_data = {
        "type": "embedding",
        "text": request.text[:100],  # Hash first 100 chars for key
        "model": request.model or "default",
    }
    
    cached = await cache.get("embedding", cache_data)
    if cached:
        return EmbedResponse(**cached, cached=True)
    
    try:
        embed_request = EmbeddingRequest(
            text=request.text,
            model=request.model,
        )
        
        response = await factory.embed(embed_request)
        
        result = {
            "embedding": response.embedding,
            "dimensions": response.dimensions,
            "model": response.model,
        }
        
        # Cache the result
        await cache.set("embedding", cache_data, result)
        
        return EmbedResponse(**result, cached=False)
        
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Embedding not supported by available providers"
        )
    except Exception as e:
        logger.error("embedding_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Embedding service unavailable: {str(e)}"
        )


@app.post("/ai/semantic-search", response_model=SemanticSearchResponse, tags=["Search"])
async def semantic_search(
    request: SemanticSearchRequest,
    factory: AIProviderFactory = Depends(get_factory),
):
    """
    Perform semantic search using vector similarity.
    
    Compares query embedding against provided embeddings
    using cosine similarity and returns top-k results.
    """
    import numpy as np
    
    try:
        # Generate embedding for query
        embed_request = EmbeddingRequest(text=request.query)
        query_response = await factory.embed(embed_request)
        query_embedding = np.array(query_response.embedding)
        
        # Calculate cosine similarity with all embeddings
        results = []
        for i, embedding in enumerate(request.embeddings):
            embedding_array = np.array(embedding)
            
            # Cosine similarity
            dot_product = np.dot(query_embedding, embedding_array)
            norm_a = np.linalg.norm(query_embedding)
            norm_b = np.linalg.norm(embedding_array)
            
            if norm_a > 0 and norm_b > 0:
                similarity = dot_product / (norm_a * norm_b)
            else:
                similarity = 0.0
            
            results.append(SemanticSearchResult(
                index=i,
                score=float(similarity)
            ))
        
        # Sort by score and take top-k
        results.sort(key=lambda x: x.score, reverse=True)
        top_results = results[:request.top_k]
        
        return SemanticSearchResponse(
            results=top_results,
            query_embedding=query_response.embedding,
        )
        
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Embeddings not supported by available providers"
        )
    except Exception as e:
        logger.error("semantic_search_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Search service unavailable: {str(e)}"
        )


# ============================================================================
# Run with Uvicorn
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
