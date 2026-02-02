/**
 * Debounce utility function
 * Delays function execution until after a specified wait time has elapsed
 * since the last time it was invoked.
 * 
 * Perfect for search inputs - waits for user to stop typing before making API call
 * 
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay (default: 500ms)
 * @returns {Function} - The debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => {
 *   fetchSearchResults(query);
 * }, 500);
 * 
 * // In your input handler:
 * onChange={(e) => debouncedSearch(e.target.value)}
 */
export function debounce(func, wait = 500) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility function
 * Ensures function is called at most once per specified time period
 * 
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export function throttle(func, limit = 1000) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export default debounce;
