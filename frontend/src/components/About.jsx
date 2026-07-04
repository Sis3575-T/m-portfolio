import React from 'react';
import { getImageUrl } from '../api';
import './About.css';

const cvUrl = import.meta.env.VITE_CV_URL || '/cv.pdf';
const googleViewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cvUrl)}`;

function About({ settings, sectionTitle, sectionSubtitle }) {
  const {
    profilePhoto,
    shortBio,
    longBio,
    name,
    city,
    country,
    yearsOfExperience,
    freelanceAvailable,
    email,
    phone,
    address,
  } = settings || {};

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST';

  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">About</span>
          <h2 className="section-title">{sectionTitle || 'About Me'}</h2>
          <div className="section-line" />
        </div>

        <div className="about-layout">
          <p className="about-bio">
            {longBio || shortBio || 'I build polished digital products that blend thoughtful design with reliable engineering.'}
          </p>

          <div className="about-facts">
            <div className="about-fact">
              <div className="fact-icon">📍</div>
              <div>
                <p className="fact-label">Location</p>
                <p className="fact-value">{city || 'Bahir Dar'}, {country || 'Ethiopia'}</p>
              </div>
            </div>
            <div className="about-fact">
              <div className="fact-icon">📧</div>
              <div>
                <p className="fact-label">Email</p>
                <p className="fact-value">{email || 'sisay3575@gmail.com'}</p>
              </div>
            </div>
            <div className="about-fact">
              <div className="fact-icon">💼</div>
              <div>
                <p className="fact-label">Experience</p>
                <p className="fact-value">{yearsOfExperience || '2+'} Years</p>
              </div>
            </div>
            <div className="about-fact">
              <div className="fact-icon">🚀</div>
              <div>
                <p className="fact-label">Status</p>
                <p className="fact-value">{freelanceAvailable !== false ? 'Open for work' : 'Busy'}</p>
              </div>
            </div>
          </div>

          <div className="about-actions">
            <a href={googleViewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View CV</a>
            <a href={cvUrl} download="Sisay_Temesgen_CV.pdf" className="btn btn-primary">Download CV</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
