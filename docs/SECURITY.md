# Security Features

## File Upload Security

### Virus Scanning

The platform includes automatic virus scanning for all file uploads.

**Default Mode (Basic Validation):**
- Detects executable files (PE, ELF, Mach-O)
- Blocks shell scripts
- Scans for suspicious JavaScript patterns
- Validates file types against whitelist

**Enhanced Mode (ClamAV):**
For production environments, install ClamAV for comprehensive virus scanning:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install clamav clamav-daemon

# Update virus definitions
sudo freshclam

# Start ClamAV daemon (optional, for faster scans)
sudo systemctl start clamav-daemon
sudo systemctl enable clamav-daemon
```

The system will automatically detect and use ClamAV when available.

### File Type Restrictions

**Allowed extensions:**
- Documents: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.txt`, `.rtf`, `.odt`
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`, `.ico`
- Code/Archives: `.zip`, `.rar`, `.7z`, `.tar`, `.gz`, `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.cpp`, `.c`, `.h`, `.css`, `.html`, `.json`, `.xml`
- Media: `.mp4`, `.webm`, `.mp3`, `.wav`, `.ogg`

**Blocked types:**
- Executables (`.exe`, `.dll`, `.so`, `.dylib`)
- Scripts (`.sh`, `.bat`, `.cmd`)
- Any file type not in whitelist

### File Size Limits

- **General files**: 50MB maximum
- **Archives** (`.zip`, `.rar`, `.7z`, `.tar`, `.gz`): 100MB maximum

## Pusher Channel Authorization

All private Pusher channels require authorization:

- **private-conversation-{userId}**: User must have message history with the other user
- **private-job-{jobId}**: User must be the job client OR have applied to the job
- **private-contract-{contractId}**: User must be either the client or freelancer on the contract
- **presence-*** : All authenticated users allowed
- **public-announcements**: All users allowed

## Best Practices

1. **Enable ClamAV in production** for enhanced virus detection
2. **Regular updates**: Run `sudo freshclam` daily (add to cron)
3. **Monitor logs**: Check for blocked files in application logs
4. **Audit uploads**: Review attachments table regularly for suspicious activity

## Database Tracking

All file uploads are tracked in the `attachments` table:

```sql
SELECT 
  a.filename, 
  a.mime_type, 
  a.size, 
  u.email AS uploaded_by,
  a.uploaded_at
FROM attachments a
JOIN users u ON a.uploaded_by = u.id
ORDER BY a.uploaded_at DESC
LIMIT 100;
```

Files are automatically deleted from filesystem and database when contracts are removed.
