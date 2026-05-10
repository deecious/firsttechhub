# FirstTechHub Website

A modern responsive website scaffold for a technology company called FirstTechHub.

## Included pages

- `index.html` - Home page with hero, services, course preview, testimonials
- `about.html` - Company overview, mission, vision, and benefits
- `services.html` - Tech training, IT consulting, and business solutions details
- `courses.html` - Course catalog loaded from shared site data (Software Development, Networking, Cybersecurity, Children's Computing, AI Skills)
- `testimonials.html` - Client and learner feedback
- `blog.html` - Blog posts loaded from shared site data
- `contact.html` - Contact form, phone/email details, and map integration
- `signup-new.html` - Two-step user registration for students, learners, tutors, and parents
- `forgot-password.html` - Password recovery and reset workflow
- `account.html` - Account management dashboard for editing profile and changing passwords
- `admin.html` - Simple browser-based CMS to update courses and blog content
- `llm-portal.html` - LLM portal to manage students, learners, tutors, mentors, classes, tasks, and assignments

## Asset files

- `css/style.css` - Responsive visual design, animations, and layout
- `js/main.js` - Navigation, dynamic course/blog rendering, and contact form behavior
- `js/admin.js` - LocalStorage-based CMS data editor for courses and blog posts
- `data/content.js` - Default course, testimonial, and blog content data

## Run locally

Open any of the `.html` files in a browser. For best results, use a local web server if your browser restricts local script access.

## Notes

- `admin.html` saves course and blog updates to browser local storage.
- Refresh the relevant pages after using the admin panel to see updates.
- The Google Maps iframe uses an example embed URL and can be replaced with your own location.
