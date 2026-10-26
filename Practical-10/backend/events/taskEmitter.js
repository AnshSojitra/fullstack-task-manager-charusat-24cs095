/**
 * Dedicated EventEmitter Module for Task Management Events
 * Practical 10: Asynchronous Processing with Event-Driven Architecture
 * CHARUSAT ITUE301 - Advanced Web Development Frameworks
 * Student: Ansh Sojitra | ID: 24CS095
 *
 * Implements a centralized, decoupled Node.js EventEmitter for domain events
 * (e.g. task:created, task:deleted, task:updated).
 *
 * NOTE: EventEmitter is an in-process, non-persistent event bus.
 * Events are executed in memory within the Node.js event loop and are not
 * durable across server restarts (unlike distributed message brokers like RabbitMQ or Kafka).
 */

const { EventEmitter } = require("node:events");

class TaskEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Allow up to 20 concurrent listeners per event without memory leak warnings
    this.setMaxListeners(20);

    // Global error listener to prevent unhandled 'error' events from crashing the process
    this.on("error", (err) => {
      console.error("[TaskEventEmitter ERROR] Unhandled event error caught:", err.message);
    });
  }
}

// Singleton emitter instance used across the backend
const taskEmitter = new TaskEventEmitter();

module.exports = taskEmitter;
