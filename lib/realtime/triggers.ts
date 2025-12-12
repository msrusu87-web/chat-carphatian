/**
 * Real-time Event Triggers
 * 
 * Server-side functions to trigger real-time events.
 * Use these in API routes and server actions.
 * 
 * Built by Carphatian
 */

import { trigger, triggerBatch, Channels, Events } from './pusher'

/**
 * Send a real-time notification to a user
 */
export async function triggerNotification(
  userId: number | string,
  notification: {
    id?: number
    type: string
    title: string
    message: string
    link?: string
    createdAt?: string
  }
): Promise<boolean> {
  return trigger(
    Channels.user(userId),
    Events.NEW_NOTIFICATION,
    {
      ...notification,
      createdAt: notification.createdAt || new Date().toISOString(),
    }
  )
}

/**
 * Send a real-time message to a conversation
 */
export async function triggerNewMessage(
  conversationId: number | string,
  message: {
    id: number
    senderId: number
    senderName: string
    content: string
    createdAt: string
    attachments?: any[]
  }
): Promise<boolean> {
  return trigger(
    Channels.conversation(conversationId),
    Events.NEW_MESSAGE,
    message
  )
}

/**
 * Mark message as read
 */
export async function triggerMessageRead(
  conversationId: number | string,
  messageId: number | string
): Promise<boolean> {
  return trigger(
    Channels.conversation(conversationId),
    Events.MESSAGE_READ,
    { messageId }
  )
}

/**
 * Notify about new application
 */
export async function triggerNewApplication(
  clientUserId: number | string,
  application: {
    id: number
    jobId: number
    jobTitle: string
    freelancerName: string
    freelancerId: number
  }
): Promise<boolean> {
  return trigger(
    Channels.user(clientUserId),
    Events.NEW_APPLICATION,
    application
  )
}

/**
 * Notify about application status change
 */
export async function triggerApplicationStatus(
  freelancerUserId: number | string,
  application: {
    id: number
    jobId: number
    jobTitle: string
    status: 'accepted' | 'rejected' | 'pending'
  }
): Promise<boolean> {
  return trigger(
    Channels.user(freelancerUserId),
    Events.APPLICATION_STATUS,
    application
  )
}

/**
 * Notify about contract update
 */
export async function triggerContractUpdate(
  contractId: number | string,
  userIds: (number | string)[],
  update: {
    type: 'status' | 'milestone' | 'payment' | 'message'
    message: string
    data?: any
  }
): Promise<boolean> {
  // Trigger to contract channel
  await trigger(Channels.contract(contractId), Events.CONTRACT_UPDATE, update)

  // Also notify each user
  const events = userIds.map(userId => ({
    channel: Channels.user(userId),
    event: Events.CONTRACT_UPDATE,
    data: { contractId, ...update },
  }))

  return triggerBatch(events)
}

/**
 * Notify about payment received
 */
export async function triggerPaymentReceived(
  userId: number | string,
  payment: {
    id: number
    amount: number
    currency: string
    contractId?: number
    description?: string
  }
): Promise<boolean> {
  return trigger(
    Channels.user(userId),
    Events.PAYMENT_RECEIVED,
    payment
  )
}

/**
 * Notify about milestone completion
 */
export async function triggerMilestoneComplete(
  contractId: number | string,
  userIds: (number | string)[],
  milestone: {
    id: number
    title: string
    amount: number
  }
): Promise<boolean> {
  const events = userIds.map(userId => ({
    channel: Channels.user(userId),
    event: Events.MILESTONE_COMPLETE,
    data: { contractId, ...milestone },
  }))

  return triggerBatch(events)
}
