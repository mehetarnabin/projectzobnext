/**
 * Event object
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} date
 * @property {string} time
 * @property {string} location
 * @property {'conference' | 'workshop' | 'meeting' | 'social' | 'other'} category
 * @property {'upcoming' | 'ongoing' | 'completed' | 'cancelled'} status
 * @property {string[]} attendees
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Event form data object
 * @typedef {Object} EventFormData
 * @property {string} title
 * @property {string} description
 * @property {string} date
 * @property {string} time
 * @property {string} location
 * @property {'conference' | 'workshop' | 'meeting' | 'social' | 'other'} category
 */

export {};
