/**
 * Notification Helper
 * Built by Carphatian
 * 
 * Utility functions for creating and managing notifications
 */

import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'

type NotificationType = 'message' | 'application' | 'contract' | 'payment' | 'review' | 'job' | 'milestone' | 'system'

interface CreateNotificationParams {
  userId: number
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const [notification] = await db.insert(notifications).values({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    }).returning()

    return notification
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: number[],
  notification: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const values = userIds.map(userId => ({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      metadata: notification.metadata ? JSON.stringify(notification.metadata) : null,
    }))

    await db.insert(notifications).values(values)
    return true
  } catch (error) {
    console.error('Failed to create bulk notifications:', error)
    return false
  }
}

// Pre-defined notification templates
export const NotificationTemplates = {
  newMessage: (senderName: string, contractId: number) => ({
    type: 'message' as NotificationType,
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    link: `/messages?contract=${contractId}`,
  }),

  newApplication: (freelancerName: string, jobTitle: string, jobId: number) => ({
    type: 'application' as NotificationType,
    title: 'New Application',
    message: `${freelancerName} applied for "${jobTitle}"`,
    link: `/client/jobs/${jobId}`,
  }),

  applicationAccepted: (jobTitle: string, contractId: number) => ({
    type: 'application' as NotificationType,
    title: 'Application Accepted!',
    message: `Your application for "${jobTitle}" has been accepted`,
    link: `/freelancer/contracts/${contractId}`,
  }),

  applicationRejected: (jobTitle: string) => ({
    type: 'application' as NotificationType,
    title: 'Application Update',
    message: `Your application for "${jobTitle}" was not selected`,
    link: '/freelancer/applications',
  }),

  contractCreated: (jobTitle: string, contractId: number) => ({
    type: 'contract' as NotificationType,
    title: 'New Contract',
    message: `A new contract has been created for "${jobTitle}"`,
    link: `/contracts/${contractId}`,
  }),

  contractCompleted: (jobTitle: string, contractId: number) => ({
    type: 'contract' as NotificationType,
    title: 'Contract Completed',
    message: `The contract for "${jobTitle}" has been marked as complete`,
    link: `/contracts/${contractId}`,
  }),

  paymentReceived: (amount: number, jobTitle: string) => ({
    type: 'payment' as NotificationType,
    title: 'Payment Received',
    message: `You received $${amount.toFixed(2)} for "${jobTitle}"`,
    link: '/freelancer/earnings',
  }),

  paymentSent: (amount: number, jobTitle: string) => ({
    type: 'payment' as NotificationType,
    title: 'Payment Sent',
    message: `Payment of $${amount.toFixed(2)} for "${jobTitle}" has been processed`,
    link: '/client/payments',
  }),

  newReview: (reviewerName: string, rating: number) => ({
    type: 'review' as NotificationType,
    title: 'New Review',
    message: `${reviewerName} left you a ${rating}-star review`,
    link: '/profile',
  }),

  milestoneCompleted: (milestoneName: string, contractId: number) => ({
    type: 'milestone' as NotificationType,
    title: 'Milestone Completed',
    message: `Milestone "${milestoneName}" has been marked as complete`,
    link: `/contracts/${contractId}`,
  }),

  systemAlert: (message: string) => ({
    type: 'system' as NotificationType,
    title: 'System Notification',
    message,
    link: undefined,
  }),
}
