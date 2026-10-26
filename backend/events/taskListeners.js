/**
 * Task Event Listeners Module
 * Practical 10: Asynchronous Processing with Event-Driven Architecture
 * CHARUSAT ITUE301 - Advanced Web Development Frameworks
 * Student: Ansh Sojitra | ID: 24CS095
 *
 * Registers decoupled event listeners loaded exactly once at server startup.
 * Simulates asynchronous external notification processing (email/push dispatch)
 * without blocking the HTTP request-response cycle.
 */

let isInitialized = false;

// Event telemetry history for automated testing and auditing
const eventAuditLog = [];

/**
 * Initialize all task event listeners
 * Guaranteed to execute only once to prevent duplicate handler registrations.
 * @param {import('node:events').EventEmitter} emitter
 */
function initTaskEventListeners(emitter) {
  if (isInitialized) {
    if (process.env.NODE_ENV !== "test") {
      console.log("[EventListeners] Already initialized. Skipping duplicate registration.");
    }
    return;
  }

  isInitialized = true;
  console.log("[EventListeners] Initializing event listeners for 'task:created' and 'task:deleted'...");

  /**
   * Listener for 'task:created'
   * Decoupled notification worker: simulates sending emails/webhooks asynchronously.
   */
  emitter.on("task:created", async (payload) => {
    const handlerStartTime = Date.now();
    const eventRecord = {
      event: "task:created",
      taskId: payload.taskId,
      title: payload.title,
      userEmail: payload.user?.email,
      dispatchedAt: payload.timestamp,
      handlerStartedAt: new Date(handlerStartTime).toISOString(),
      completedAt: null,
      status: "processing",
    };
    eventAuditLog.push(eventRecord);

    console.log(
      `\x1b[36m[Event: task:created RECEIVED]\x1b[0m Task ID: ${payload.taskId} | Title: "${payload.title}" | User: ${payload.user?.email || "anonymous"} | At: ${new Date(handlerStartTime).toISOString()}`
    );

    try {
      console.log(
        `\x1b[33m[Notification Service STARTED]\x1b[0m Dispatching async notification for task "${payload.title}" (simulating external email API)...`
      );

      // Simulate asynchronous I/O (e.g. SMTP email send, push notification, webhook call)
      const simulatedDelayMs = payload.simulatedDelayMs || 500;
      await new Promise((resolve) => setTimeout(resolve, simulatedDelayMs));

      const completionTime = Date.now();
      eventRecord.completedAt = new Date(completionTime).toISOString();
      eventRecord.status = "completed";
      eventRecord.processingDurationMs = completionTime - handlerStartTime;

      console.log(
        `\x1b[32m[Notification Service COMPLETED]\x1b[0m Notification delivered for task "${payload.title}" (${payload.taskId}) at ${eventRecord.completedAt} (Duration: ${eventRecord.processingDurationMs}ms)`
      );
    } catch (error) {
      eventRecord.status = "failed";
      eventRecord.error = error.message;
      console.error(
        `\x1b[31m[Notification Service ERROR]\x1b[0m Failed delivering notification for task ${payload.taskId}:`,
        error.message
      );
    }
  });

  /**
   * Listener for 'task:deleted'
   * Decoupled audit/cleanup worker: logs task removal and cleans associated resources.
   */
  emitter.on("task:deleted", async (payload) => {
    const handlerStartTime = Date.now();
    const eventRecord = {
      event: "task:deleted",
      taskId: payload.taskId,
      title: payload.title,
      userEmail: payload.user?.email,
      dispatchedAt: payload.timestamp,
      handlerStartedAt: new Date(handlerStartTime).toISOString(),
      completedAt: null,
      status: "processing",
    };
    eventAuditLog.push(eventRecord);

    console.log(
      `\x1b[35m[Event: task:deleted RECEIVED]\x1b[0m Task ID: ${payload.taskId} | Deleted by: ${payload.user?.email || "anonymous"} | At: ${new Date(handlerStartTime).toISOString()}`
    );

    try {
      // Simulate asynchronous audit log write or cloud storage cleanup (300ms)
      const simulatedDelayMs = payload.simulatedDelayMs || 300;
      await new Promise((resolve) => setTimeout(resolve, simulatedDelayMs));

      const completionTime = Date.now();
      eventRecord.completedAt = new Date(completionTime).toISOString();
      eventRecord.status = "completed";
      eventRecord.processingDurationMs = completionTime - handlerStartTime;

      console.log(
        `\x1b[32m[Audit Service COMPLETED]\x1b[0m Task deletion record archived for task ID ${payload.taskId} at ${eventRecord.completedAt}`
      );
    } catch (error) {
      eventRecord.status = "failed";
      eventRecord.error = error.message;
      console.error(
        `\x1b[31m[Audit Service ERROR]\x1b[0m Failed archiving deletion for task ${payload.taskId}:`,
        error.message
      );
    }
  });
}

/**
 * Access audit records for testing and verification
 */
function getEventAuditLog() {
  return eventAuditLog;
}

function clearEventAuditLog() {
  eventAuditLog.length = 0;
}

module.exports = {
  initTaskEventListeners,
  getEventAuditLog,
  clearEventAuditLog,
};
