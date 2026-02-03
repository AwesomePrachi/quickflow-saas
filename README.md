#⚡ Quickflow — Smart Workflow SaaS

Quickflow is a modern, multi-tenant SaaS platform for task management, team collaboration, and productivity analytics.  
It is designed with enterprise-grade role-based access control (RBAC), real-time insights, and a clean, professional user experience.

This project demonstrates real-world SaaS architecture, secure backend engineering, and analytics-driven decision making.

---

## ✨ Key Highlights

- Multi-tenant SaaS architecture with strict organization-level data isolation  
- Enterprise-grade Role-Based Access Control (RBAC)  
- Real-time Kanban workflow with analytics dashboards  
- Secure authentication and backend authorization (defense-in-depth)  
- Fully deployable using a zero-cost toolchain  

---

## 🧠 Problem Statement

Teams often lack visibility into:
- Productivity trends  
- Overloaded team members (burnout risk)  
- Task bottlenecks and overdue work  
- Safe and clear permission management  

Quickflow solves these problems by combining structured workflow management with real-time, rule-based insights.

---

## 🧩 Core Features

### 1. Advanced Task Board (Kanban)

- Drag-and-drop workflow with:
  - Open
  - In Progress
  - Completed
- Full task CRUD support:
  - Title, priority, due date, assignee
- Role-aware task visibility
- Real-time UI updates

### 2. Professional Dashboard & Analytics

- Real-time productivity trend (last 7 days)
- Integer-based chart scaling (1–10 with 10+ overflow)
- Burnout risk detection (overloaded members)
- Bottleneck detection (overdue tasks)
- Organization-level performance overview
- CSV export of all tasks

### 3. Role-Based Access Control (RBAC)

**Admin**
- Full control over organization, users, and tasks
- Role assignment and ownership transfer
- Safety checks to prevent accidental admin removal

**Leader**
- Create and manage team tasks
- View team analytics
- Restricted from deleting completed tasks

**Member**
- View and update assigned tasks only
- Access personal productivity insights

> Permissions are enforced on both frontend and backend.

### 4. User & Team Management

- Secure organization-level data isolation
- Member invite flow with temporary credentials
- Context-aware UI actions (role-based menus)
- Protection against self-deletion and orphaned organizations

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS + custom Vanilla CSS, Framer Motion, Lucide React,Chart.js
- **Backend:** Node.js, Express.js, Sequelize ORM
- **Database:** MySQL
- **Security:** JWT-based authentication, Bcrypt password hashing
- **Other:** dotenv for environment variables, CORS

---

### Multi-Tenancy
- All core entities scoped by `organization_id`
- JWT tokens include `user_id`, `organization_id`, and `role`
- No cross-organization data access permitted

---

## 📊 Rule-Based Insight Engine

The analytics system is deterministic and does not rely on paid AI services.

Insights include:
- Productivity score (completed vs assigned tasks)
- Late task detection
- Workload imbalance detection
- Burnout risk indicators
- Weekly performance trends

---

## 📤 Reporting

- Weekly organization-level reports
- CSV export with:
  - Sequential task numbering (1, 2, 3…)
  - Ordered by creation date

---

## 🔐 Security & Reliability

- Passwords hashed using bcrypt
- JWT-based stateless authentication
- Backend authorization on every request
- Role-aware frontend rendering
- Consistent error handling and validation

---

## 🚀 Deployment

- Frontend: Vercel  
- Backend: Render  
- Database: Free MySQL hosting  

The project is fully production-ready using a zero-cost stack.

---

## 🎯 What This Project Demonstrates

- Real-world SaaS architecture
- Secure RBAC implementation
- Multi-tenant backend design
- Analytics-driven product thinking
- End-to-end ownership (design to deployment)

---

## 📌 Future Enhancements

- PWA support
- Advanced analytics filters
- Email notifications
- Third-party integrations
- Subscription & billing support

---

## License

[MIT](./LICENSE)

---

## Author

**Prachi Patel**  
Full Stack Developer 

---

⭐ If you like this project, consider giving it a star on GitHub!
