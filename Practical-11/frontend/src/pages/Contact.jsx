import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Contact & Student Information Page
 * Practical 8: Performance Optimization and Lazy Loading in React
 * Student: Ansh Sojitra | Student ID: 24CS095 | CHARUSAT ITUE301
 *
 * This route is split into its own independent JavaScript chunk using
 * React.lazy() and loaded on-demand when the user navigates to /contact.
 */
function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject line is required.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message content is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API submission latency
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      category: "general",
      subject: "",
      message: "",
    });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="contact-page-layout">
      {/* Route Header */}
      <section className="contact-hero-banner">
        <div className="contact-hero-content">
          <div className="route-badge">
            <span className="route-dot" />
            <span>Code-Split Route: /contact (Chunk Loaded via React.lazy)</span>
          </div>
          <h1 className="contact-hero-title">Get in Touch &amp; Academic Feedback</h1>
          <p className="contact-hero-subtitle">
            CHARUSAT ITUE301 Advanced Web Development Frameworks • Practical 8 Performance Optimization
          </p>
        </div>
      </section>

      <div className="contact-container">
        {/* Left Column: Student & Academic Details */}
        <aside className="contact-info-panel">
          <div className="info-card student-profile-card">
            <div className="card-avatar">👨‍💻</div>
            <h2 className="student-card-name">Ansh Sojitra</h2>
            <p className="student-card-id">Student ID: 24CS095</p>
            <p className="student-card-dept">
              Department of Information Technology (CSPIT)
              <br />
              Charotar University of Science &amp; Technology (CHARUSAT)
            </p>
          </div>

          <div className="info-card practical-meta-card">
            <h3 className="meta-card-title">⚡ Practical 8 Optimization Highlights</h3>
            <ul className="meta-features-list">
              <li>
                <strong>Route Code Splitting:</strong> This page is only fetched over the wire when <code>/contact</code> is opened.
              </li>
              <li>
                <strong>Reduced Initial Payload:</strong> Users viewing the task board do not waste bandwidth on contact form logic.
              </li>
              <li>
                <strong>Suspense Fallback:</strong> Accessible loading skeleton displayed while chunk is retrieved.
              </li>
              <li>
                <strong>Component Memoization:</strong> Task cards and forms optimized with <code>React.memo</code> and <code>useCallback</code>.
              </li>
            </ul>
          </div>

          <div className="info-card nav-quick-card">
            <Link to="/" className="btn btn-primary btn-block">
              ← Return to Task Management Board
            </Link>
          </div>
        </aside>

        {/* Right Column: Contact Form */}
        <main className="contact-form-panel">
          {submitted ? (
            <div className="contact-success-card" role="status">
              <div className="success-icon">✅</div>
              <h2>Message Received!</h2>
              <p>
                Thank you, <strong>{formData.name}</strong>. Your feedback has been registered under category <em>"{formData.category}"</em>.
              </p>
              <div className="submitted-summary">
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Subject:</strong> {formData.subject}</p>
                <p><strong>Message:</strong> {formData.message}</p>
              </div>
              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={handleReset}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form-card" onSubmit={handleSubmit} noValidate>
              <h2 className="form-title">Send a Note / Viva Inquiry</h2>
              <p className="form-subtitle">
                Fill in the details below to test contact route interactivity and client-side validation.
              </p>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="contact-name">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    className={`form-input ${errors.name ? "input-error" : ""}`}
                    placeholder="e.g. Prof. Examiner / Evaluator"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.name && <span className="field-error-text">{errors.name}</span>}
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="contact-email">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    className={`form-input ${errors.email ? "input-error" : ""}`}
                    placeholder="e.g. evaluator@charusat.ac.in"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.email && <span className="field-error-text">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="contact-category">Inquiry Category</label>
                  <select
                    id="contact-category"
                    name="category"
                    className="form-input"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  >
                    <option value="general">General University Inquiry</option>
                    <option value="viva">Practical 8 Viva &amp; Performance Review</option>
                    <option value="feedback">React Architecture Feedback</option>
                    <option value="bug">Feature / Optimization Suggestion</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="contact-subject">
                    Subject <span className="required">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    className={`form-input ${errors.subject ? "input-error" : ""}`}
                    placeholder="e.g. Practical 8 Performance Verification"
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.subject && <span className="field-error-text">{errors.subject}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  className={`form-textarea ${errors.message ? "input-error" : ""}`}
                  placeholder="Provide your feedback, examiner remarks, or test message here..."
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.message && <span className="field-error-text">{errors.message}</span>}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Submit Inquiry"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  Clear Form
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

export default Contact;
