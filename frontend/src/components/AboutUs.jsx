import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/components/AboutUs.css';

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Satyam More',
      role: 'Founder & CEO',
      description: 'Visionary leader with a passion for fashion and technology. Satyam founded Fashion Hub with the mission to make quality fashion accessible to everyone.',
      expertise: ['Strategic Planning', 'Business Development', 'Fashion Industry', 'Leadership'],
      avatar: '👨‍💼',
      color: '#d97706'
    },
    {
      id: 2,
      name: 'Siddharth Mane',
      role: 'Chief Technology Officer',
      description: 'Tech enthusiast and full-stack developer who brings innovative solutions to life. Siddharth leads our technical team and ensures seamless user experiences.',
      expertise: ['Full-Stack Development', 'System Architecture', 'Database Design', 'DevOps'],
      avatar: '👨‍💻',
      color: '#059669'
    },
    {
      id: 3,
      name: 'Tukaram Jagadale',
      role: 'Head of Operations',
      description: 'Operations expert who ensures smooth business processes and exceptional customer service. Tukaram manages our supply chain and logistics operations.',
      expertise: ['Operations Management', 'Supply Chain', 'Quality Assurance', 'Customer Relations'],
      avatar: '👨‍🔧',
      color: '#7c3aed'
    }
  ];

  const companyStats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '500+', label: 'Products' },
    { number: '50+', label: 'Brands' },
    { number: '24/7', label: 'Support' }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'Quality First',
      description: 'We never compromise on quality and ensure every product meets our high standards.'
    },
    {
      icon: '💝',
      title: 'Customer Centric',
      description: 'Our customers are at the heart of everything we do. Their satisfaction is our priority.'
    },
    {
      icon: '🌱',
      title: 'Sustainability',
      description: 'We are committed to sustainable fashion practices and environmental responsibility.'
    },
    {
      icon: '🚀',
      title: 'Innovation',
      description: 'We continuously innovate to provide the best shopping experience and latest trends.'
    }
  ];

  return (
    <div>
      <Navbar />
      <div className="about-us-container">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1 className="about-title">About Fashion Hub</h1>
            <p className="about-subtitle">
              Where tradition meets modern elegance. We're passionate about bringing you the finest fashion 
              that celebrates both timeless classics and contemporary trends.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="about-story">
          <div className="container">
            <div className="story-content">
              <div className="story-text">
                <h2>Our Story</h2>
                <p>
                  Fashion Hub was born from a simple yet powerful vision: to make quality fashion accessible 
                  to everyone. Founded in 2024, we started as a small team with big dreams and an unwavering 
                  commitment to excellence.
                </p>
                <p>
                  Today, we've grown into a trusted fashion destination, serving thousands of customers across 
                  the country. Our journey is driven by innovation, quality, and most importantly, our customers' 
                  trust and satisfaction.
                </p>
              </div>
              <div className="story-image">
                <div className="story-placeholder">
                  <span className="story-icon">🏢</span>
                  <p>Fashion Hub Headquarters</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-stats">
          <div className="container">
            <div className="stats-grid">
              {companyStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="about-team">
          <div className="container">
            <div className="section-header">
              <h2>Meet Our Team</h2>
              <p>The passionate individuals behind Fashion Hub's success</p>
            </div>
            
            <div className="team-grid">
              {teamMembers.map((member) => (
                <div key={member.id} className="team-card">
                  <div className="team-avatar" style={{ backgroundColor: member.color }}>
                    <span className="avatar-icon">{member.avatar}</span>
                  </div>
                  <div className="team-info">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role" style={{ color: member.color }}>{member.role}</p>
                    <p className="team-description">{member.description}</p>
                    <div className="team-expertise">
                      <h4>Expertise:</h4>
                      <div className="expertise-tags">
                        {member.expertise.map((skill, index) => (
                          <span key={index} className="expertise-tag" style={{ borderColor: member.color }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values">
          <div className="container">
            <div className="section-header">
              <h2>Our Values</h2>
              <p>The principles that guide everything we do</p>
            </div>
            
            <div className="values-grid">
              {values.map((value, index) => (
                <div key={index} className="value-card">
                  <div className="value-icon">{value.icon}</div>
                  <h3 className="value-title">{value.title}</h3>
                  <p className="value-description">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="about-mission">
          <div className="container">
            <div className="mission-content">
              <div className="mission-text">
                <h2>Our Mission</h2>
                <p>
                  To democratize fashion by providing high-quality, trendy, and affordable clothing 
                  that empowers individuals to express their unique style and personality.
                </p>
                <div className="mission-points">
                  <div className="mission-point">
                    <span className="point-icon">✨</span>
                    <span>Curate the finest fashion collections</span>
                  </div>
                  <div className="mission-point">
                    <span className="point-icon">🤝</span>
                    <span>Build lasting relationships with customers</span>
                  </div>
                  <div className="mission-point">
                    <span className="point-icon">🌍</span>
                    <span>Promote sustainable fashion practices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;