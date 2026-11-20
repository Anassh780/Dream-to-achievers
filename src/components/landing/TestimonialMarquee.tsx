import React from 'react';
import { CustomerReviewsSection } from './CustomerReviewsSection';

/**
 * TestimonialMarquee wraps CustomerReviewsSection for full backward compatibility
 * while delivering the rich SaaS 10-year experience customer reviews system.
 */
export const TestimonialMarquee: React.FC = () => {
  return <CustomerReviewsSection />;
};

export default TestimonialMarquee;
