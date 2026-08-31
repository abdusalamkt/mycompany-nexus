# Company Hub Connect

Build a secure internal company portal for a company with approximately 100 employees.

This is a PRIVATE INTERNAL COMPANY PORTAL.

It is NOT a public website, marketing website, ecommerce website, or public employee directory.

The entire application must require authentication before any internal content can be accessed.

The portal will be used by:

- Super Admin

- Admin

- HR

- Employees

- Workers

The portal will manage:

- Employee information

- Worker information

- Passport information

- Visa information

- Employee documents

- Certificates

- Company licenses

- Leave information

- Expiry notifications

- Company news

- Organization charts

- Policies

- Memos

- Sales information

- Marketing information

- Production information

- O&P information

- Internal company resources

==================================================

TECHNOLOGY

==================================================

Frontend:

- Next.js

- React

- TypeScript

- Tailwind CSS

- shadcn/ui where appropriate

Backend:

- Supabase

- Supabase Authentication

- PostgreSQL

- Supabase Storage

The application must be modular, scalable and production-ready.

Use a clean enterprise dashboard design.

Do not build a public landing page.

The first screen should be the login page.

==================================================

SECURITY — VERY IMPORTANT

==================================================

This portal contains sensitive employee information including passports, visas, certificates and personal information.

Security must be treated as a core requirement.

Implement:

- Supabase Authentication

- Protected routes

- Role-based access

- Granular permissions

- PostgreSQL Row Level Security (RLS)

- Private Supabase Storage buckets

- Signed URLs for sensitive documents

- Secure file uploads

- File type validation

- File size limits

- Secure sessions

- Password reset

- Account activation/deactivation

- Audit logging

- Rate limiting where appropriate

NEVER expose employee documents through public storage URLs.

NEVER put Supabase service-role keys in frontend/client-side code.

NEVER rely only on frontend permission checks.

Permissions must also be enforced at the database/backend level.

==================================================

SEARCH ENGINE PROTECTION

==================================================

This is a private internal company portal.

It must not be indexed by:

- Google

- Bing

- Yahoo

- Other search engines

Implement:

- robots.txt restrictions

- noindex

- nofollow

- noarchive

However, authentication and authorization are the actual security mechanisms.

Unauthenticated users must not be able to access internal pages or employee information even if they know the URL.

==================================================

AUTHENTICATION

==================================================

Use Supabase Auth.

Every user must have their own account.

Create:

/login

/forgot-password

/reset-password

Requirements:

- Email/password login

- Logout

- Forgot password

- Password reset

- Email verification

- Protected routes

- Session persistence

- Session expiration handling

- Account activation/deactivation

Unauthenticated users attempting to access protected pages must be redirected to /login.

Prepare the architecture for MFA, especially for:

- Super Admin

- Admin

- HR

After successful login, redirect the user to /dashboard.

==================================================

USER ROLES

==================================================

Create the following roles:

1. Super Admin

2. Admin

3. HR

4. Employee

5. Worker

Do not hard-code the application around only these five roles.

Create a flexible role and permission system so additional roles can be added later.

Each user should have:

- Role

- Department

- Status

- Permissions

User status:

- Active

- Inactive

- Suspended

==================================================

ROLE DEFINITIONS

==================================================

SUPER ADMIN

Full system access.

Can:

- Add users

- Edit users

- Deactivate users

- Delete users where appropriate

- Manage roles

- Manage permissions

- Manage employees

- Manage workers

- Manage departments

- Manage documents

- Manage news

- Manage policies

- Manage certificates/licenses

- Manage memos

- Manage leave

- Manage notifications

- Manage Sales

- Manage Marketing

- Manage Production

- Manage O&P

- View audit logs

- Manage system settings

ADMIN

Broad administrative access according to assigned permissions.

Can be given access to:

- Employees

- Workers

- Documents

- News

- Policies

- Memos

- Departments

- Company resources

- Notifications

ADMIN must not automatically have Super Admin permissions.

HR

HR-focused access.

Can be given permissions for:

- Employee management

- Worker management

- Passport

- Visa

- Employee documents

- Certificates

- Leave

- Expiry notifications

- Staff list

- Worker list

- HR policies

EMPLOYEE

Employees should have restricted access.

Employees can potentially:

- View their own profile

- View their own authorized documents

- View company news

- View policies

- View organization charts

- View authorized company resources

- View their leave information

Employees must NOT be able to:

- Manage users

- Edit HR records

- View other employees' confidential documents

- View other employees' passport scans

- View other employees' visa documents

- Change permissions

WORKER

Workers should have a restricted access level similar to employees but with fewer permissions.

Workers can be granted:

- Own profile

- Own documents

- Company news

- Selected policies

- Leave information

- Selected company resources

==================================================

GRANULAR PERMISSION SYSTEM

==================================================

Create a permission system using:

Role

+

Permission

+

Optional department restriction

Permissions should be granular.

Dashboard:

- dashboard.view

Users:

- users.view

- users.create

- users.edit

- users.deactivate

- users.delete

- users.manage_permissions

Employees:

- employees.view

- employees.create

- employees.edit

- employees.delete

- employees.view_sensitive

Workers:

- workers.view

- workers.create

- workers.edit

- workers.delete

Documents:

- documents.view

- documents.upload

- documents.download

- documents.edit

- documents.delete

Passport:

- passport.view

- passport.upload

- passport.edit

Visa:

- visa.view

- visa.upload

- visa.edit

Leave:

- leave.view

- leave.create

- leave.edit

- leave.delete

- leave.approve

News:

- news.view

- news.create

- news.edit

- news.delete

- news.publish

Policies:

- policies.view

- policies.create

- policies.edit

- policies.delete

- policies.publish

Certificates:

- certificates.view

- certificates.create

- certificates.edit

- certificates.delete

Memos:

- memos.view

- memos.create

- memos.edit

- memos.delete

- memos.publish

Sales:

- sales.view

- sales.manage

Marketing:

- marketing.view

- marketing.manage

Production:

- production.view

- production.manage

O&P:

- operations.view

- operations.manage

Notifications:

- notifications.view

- notifications.manage

Audit:

- audit.view

Settings:

- settings.view

- settings.manage

The Super Admin must be able to assign/remove permissions.

==================================================

ADMIN PANEL

==================================================

Create a complete Admin Panel.

Sections:

1. Users

2. Roles

3. Permissions

4. Departments

5. Notifications

6. Audit Logs

7. System Settings

USER MANAGEMENT

Display:

- Name

- Email

- Employee ID

- Department

- Role

- Status

- Last Login

- Created Date

Actions:

- View

- Edit

- Deactivate

- Reactivate

- Reset access

- Change role

- Manage permissions

Do not permanently delete users by default.

When an employee leaves the company, prefer:

Status = Inactive

instead of permanently deleting the user.

==================================================

DASHBOARD

==================================================

Create a modern company dashboard.

The dashboard must be permission-aware.

Super Admin/Admin/HR dashboard should show:

- Total Employees

- Active Employees

- Workers

- Employees on Leave

- Expired Documents

- Documents Expiring Within 30 Days

- Documents Expiring Within 90 Days

- Missing Documents

Create dashboard cards.

Example:

TOTAL EMPLOYEES

100

ACTIVE EMPLOYEES

96

WORKERS

42

ON LEAVE

8

VISA EXPIRING

4

PASSPORT EXPIRING

2

CERTIFICATES EXPIRING

6

Create an Important Dates section.

Columns:

Employee

Document

Expiry Date

Days Remaining

Status

Example:

Ahmed Ali

Visa

25 Aug 2026

8 days

Critical

The dashboard should also show:

- Upcoming Expiries

- Recent News

- Recent Memos

- Notifications

- Quick Actions

Employees should only see information they are authorized to see.

==================================================

EXPIRY MANAGEMENT

==================================================

Create a reusable expiry management system.

The system must track expiry dates for:

- Passport

- Visa

- Emirates ID

- Labour Card

- Insurance

- Certificates

- Licenses

- Contracts

- Driving Licence

- Other documents

Status logic:

GREEN:

Valid

YELLOW:

Expires within 90 days

ORANGE:

Expires within 30 days

RED:

Expired

GREY:

Missing

Create configurable notification rules:

90 days before

60 days before

30 days before

15 days before

7 days before

1 day before

Expired

The system must support:

- In-app notifications

- Email notifications

Recipients should be configurable.

Possible recipients:

- Employee

- HR

- HR Manager

- Admin

- Super Admin

Create notification history.

Prevent duplicate notifications for the same rule unless explicitly configured.

Prepare a scheduled daily process to check expiry dates automatically.

==================================================

EMPLOYEE MANAGEMENT

==================================================

Create:

Employees

Workers

Employee list must support:

- Search

- Filter

- Sort

- Department

- Designation

- Status

- Joining date

- Passport status

- Visa status

- Document expiry status

==================================================

EMPLOYEE PROFILE

==================================================

Create a detailed employee profile.

PERSONAL DETAILS:

- Employee ID

- Photo

- First Name

- Last Name

- Email

- Mobile

- Department

- Designation

- Joining Date

- Employment Status

- Manager

- Emergency Contact

- Address where appropriate

PASSPORT:

- Passport Number

- Issue Date

- Expiry Date

- Issuing Country

- Passport Document

VISA:

- Visa Number

- Visa Type

- Issue Date

- Expiry Date

- Sponsor

- Visa Document

OTHER DOCUMENTS:

- Emirates ID

- Labour Card

- Insurance

- Certificates

- Contracts

- Driving Licence

- Other

LEAVE:

- Current Leave

- Upcoming Leave

- Previous Leave

==================================================

EMPLOYEE DOCUMENT SYSTEM

==================================================

Do NOT hard-code documents directly into the employee table.

Create a reusable employee_documents system.

Fields:

- ID

- Employee ID

- Document Type

- Document Number

- Issue Date

- Expiry Date

- Storage Path

- Notes

- Status

- Uploaded By

- Uploaded Date

- Updated Date

Document types:

- Passport

- Visa

- Emirates ID

- Labour Card

- Insurance

- Certificate

- Contract

- Driving Licence

- Other

Sensitive documents must be stored in PRIVATE storage.

Create secure upload/download/view functionality.

==================================================

DOCUMENT VERSIONING

==================================================

When a passport, visa or certificate is renewed, do not automatically destroy the previous document.

Maintain document history where appropriate.

Example:

Passport

Current:

Passport_2026.pdf

Previous:

Passport_2021.pdf

Only authorized users can access historical documents.

==================================================

STAFF LIST

==================================================

Create a redesigned professional Staff List.

Use a modern table/card layout.

Show:

- Photo

- Name

- Employee ID

- Designation

- Department

- Contact

- Joining Date

- Visa Status

- Passport Status

- Overall Document Status

Features:

- Search

- Department filter

- Designation filter

- Status filter

- Expiry filter

Click employee to open full profile.

==================================================

WORKERS LIST

==================================================

Create a separate Workers List.

Fields:

- Worker ID

- Name

- Photo

- Department

- Job Title

- Joining Date

- Contact

- Passport

- Visa

- Labour Card

- Insurance

- Documents

- Status

Use the same document and expiry architecture.

==================================================

LEAVE MANAGEMENT

==================================================

Create Leave Information.

Fields:

- Employee

- Leave Type

- Start Date

- End Date

- Number of Days

- Reason

- Approval Status

- Handover Person

- Handover Notes

- HR Notes

Create:

- Current Leave

- Upcoming Leave

- Previous Leave

Create list and calendar views where appropriate.

==================================================

NEWS

==================================================

Create internal company News.

Features:

- Create

- Edit

- Delete

- Draft

- Publish

- Unpublish

- Cover Image

- Rich Text Content

- Attachments

- Publish Date

Only authorized users can create/edit/publish.

Employees see published news.

==================================================

ORGANIZATION CHARTS

==================================================

Create department-wise Organization Charts.

Initial departments:

- Management

- HR

- Sales

- Marketing

- Production

- O&P

The organization chart should preferably be generated dynamically from employee manager relationships.

Allow authorized administrators to configure reporting relationships.

==================================================

POLICIES

==================================================

Create a Policies section.

Categories:

- HR Policies

- Company Policies

- Safety Policies

- IT Policies

- Department Policies

- Other

Policy fields:

- Title

- Category

- Version

- Effective Date

- Review Date

- File

- Status

- Uploaded By

Support policy versioning.

Previous versions should remain archived.

==================================================

CERTIFICATES & LICENSES

==================================================

Create a company Certificate & License register.

Fields:

- Certificate Name

- Type

- Certificate Number

- Issuing Authority

- Issue Date

- Expiry Date

- Responsible Department

- Document

- Notes

- Status

Use the same expiry notification engine.

==================================================

MEMOS

==================================================

Create an internal Memos module.

Features:

- Create Memo

- Edit Memo

- Publish

- Archive

- Attach Documents

- Select Department

- Select Users where required

Employees only see authorized memos.

==================================================

SALES

==================================================

Create a Sales module.

Sections:

1. Objectives

2. Organization Chart

3. Flow Charts

4. Sales & Marketing Planner

5. Product Catalogues / Specifications

6. Visit Reports

7. Training Videos

8. Reference List

OBJECTIVES:

Support:

- Annual objectives

- Quarterly objectives

- Department objectives

- Individual objectives where appropriate

SALES & MARKETING PLANNER:

Fields:

- Quarter

- Year

- Target

- Actual

- Achievement Percentage

- Notes

VISIT REPORTS:

Fields:

- Employee

- Client

- Date

- Location

- Person Visited

- Purpose

- Discussion

- Outcome

- Follow-up

- Attachments

TRAINING VIDEOS:

Fields:

- Title

- Description

- Category

- Video URL

- Thumbnail

- Uploaded By

PRODUCT CATALOGUES / SPECIFICATIONS:

Create a searchable document/resource library.

==================================================

MARKETING

==================================================

Create Marketing module.

Sections:

1. Objectives

2. Organization Chart

3. Marketing & Business Development

4. Flow Charts

5. Latest Brochures / Catalogues

Create reusable resource/document components.

==================================================

PRODUCTION

==================================================

Create Production module.

Initial sections:

- Overview

- Organization Chart

- Procedures

- Flow Charts

- SOPs

- Production Documents

- Training

- Quality

- Safety

Make the module expandable.

==================================================

O&P

==================================================

Create O&P module.

Initial sections:

- Objectives

- Organization Chart

- Processes

- Flow Charts

- Documents

- Reports

- Training

- Resources

Make the module expandable because more requirements may be added later.

==================================================

NOTIFICATION CENTER

==================================================

Create a notification center.

Display:

- Unread notifications

- Read notifications

- Notification type

- Date

- Related employee/document

- Action

Examples:

Passport expires in 30 days.

Visa expires in 7 days.

New company policy published.

New memo published.

Certificate expired.

Allow users to mark notifications as read.

==================================================

AUDIT LOG

==================================================

Create a comprehensive audit log.

Record:

- User

- Action

- Module

- Record ID

- Timestamp

- Previous value where appropriate

- New value where appropriate

Examples:

HR edited employee.

HR changed passport expiry.

Admin uploaded visa.

Super Admin changed permission.

Admin created user.

Admin deactivated employee.

Authorized administrators can view audit logs.

Employees must not have access to audit logs.

==================================================

USER DEACTIVATION

==================================================

When an employee leaves:

1. HR opens employee profile.

2. HR changes employment status to Inactive.

3. User account is deactivated.

4. Active sessions are revoked.

5. Employee cannot log in.

6. Historical records remain.

7. Documents remain available to authorized HR/Admin users.

8. Audit history remains.

Do not permanently delete historical employee data by default.

==================================================

EMPLOYEE ONBOARDING

==================================================

Create an HR workflow:

Add Employee

→ Personal Details

→ Photo

→ Passport

→ Visa

→ Other Documents

→ Department

→ Designation

→ Manager

→ Create User Account

→ Assign Role

→ Assign Permissions

→ Send Login Invitation

The employee can then activate their account.

==================================================

ADMIN WORKFLOW

==================================================

Super Admin:

Login

→ Dashboard

→ Users

→ Create User

→ Assign Employee

→ Select Role

→ Customize Permissions

→ Activate Account

HR:

Login

→ Dashboard

→ Employees

→ Add/Edit Employee

→ Upload Documents

→ Enter Expiry Dates

→ System monitors expiry

→ Notifications generated automatically

Employee:

Login

→ Dashboard

→ View own profile

→ View authorized information

→ View company news

→ View policies

→ View authorized resources

→ View leave information

==================================================

SEARCH

==================================================

Create global search.

Search can find authorized content such as:

- Employees

- Workers

- News

- Policies

- Memos

- Certificates

- Documents

- Sales resources

- Marketing resources

- Production resources

- O&P resources

IMPORTANT:

Search must respect permissions.

A user must never receive search results for content they are not authorized to access.

==================================================

DATABASE ARCHITECTURE

==================================================

Create a normalized PostgreSQL schema.

Suggested tables:

profiles

roles

permissions

role_permissions

user_permissions

departments

employees

workers

document_types

employee_documents

document_versions

leave_types

leaves

news

memos

policies

policy_versions

certificates

licenses

organization_charts

sales_objectives

sales_planners

visit_reports

training_videos

sales_resources

marketing_objectives

marketing_resources

production_resources

operations_resources

notifications

notification_rules

notification_history

audit_logs

system_settings

Do not create unnecessary duplicate tables.

Use foreign keys and appropriate indexes.

Add created_at and updated_at fields where appropriate.

==================================================

ROW LEVEL SECURITY

==================================================

Implement Supabase RLS policies.

Examples:

Employees should be able to view their own profile.

Employees should not be able to view another employee's sensitive information.

HR can view authorized employee information.

Admin can view information according to permissions.

Super Admin can access everything.

Users can only access documents they are authorized to access.

Users can only see notifications intended for them.

Users can only see company resources they have permission to access.

RLS policies must be carefully designed.

Do not use frontend-only permission checks.

==================================================

STORAGE

==================================================

Create private storage architecture.

Suggested structure:

employees/

    employee-id/

        passport/

        visa/

        emirates-id/

        certificates/

        contracts/

        other/

company/

    policies/

    certificates/

    licenses/

    memos/

departments/

    sales/

    marketing/

    production/

    operations/

Sensitive employee documents must remain private.

Use signed URLs for authorized viewing/downloading.

==================================================

FILE UPLOAD SECURITY

==================================================

Allow common file formats:

PDF

JPG

JPEG

PNG

DOC

DOCX

XLS

XLSX

Implement:

- File type validation

- Extension validation

- File size limits

- Secure file naming

- Private storage

- Authorization before download

- Authorization before deletion

Do not trust the filename or MIME type provided by the browser.

==================================================

DESIGN SYSTEM

==================================================

Create a professional corporate enterprise design.

Layout:

LEFT SIDEBAR

- Logo

- Dashboard

- Company

- People

- Departments

- Admin

- User profile

TOP BAR:

- Search

- Notifications

- User profile

- Logout

Use:

- Cards

- Tables

- Tabs

- Filters

- Search

- Status badges

- Modals

- Confirmation dialogs

- Toast messages

- Dropdowns

- Breadcrumbs

Create clear empty states.

Create clear loading states.

Create clear error states.

Do not overuse animations.

Prioritize usability and clarity.

==================================================

RESPONSIVE DESIGN

==================================================

Desktop:

Full sidebar and dashboard.

Tablet:

Collapsible sidebar.

Mobile:

Mobile navigation drawer.

Tables should become responsive on smaller screens.

==================================================

DASHBOARD STATUS COLORS

==================================================

Use consistent status indicators.

Valid:

Green

Expiring within 90 days:

Yellow

Expiring within 30 days:

Orange

Expired:

Red

Missing:

Grey

==================================================

SYSTEM SETTINGS

==================================================

Create settings for:

- Company name

- Company logo

- Notification rules

- Expiry thresholds

- Email notification settings

- Departments

- Document types

- Roles

- Permissions

Only authorized administrators can access system settings.

==================================================

ENVIRONMENT VARIABLES

==================================================

Prepare:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Never expose service-role credentials in frontend code.

==================================================

INITIAL SEED DATA

==================================================

Roles:

Super Admin

Admin

HR

Employee

Worker

Departments:

Management

HR

Sales

Marketing

Production

O&P

Document Types:

Passport

Visa

Emirates ID

Labour Card

Insurance

Certificate

Contract

Driving Licence

Other

==================================================

DEVELOPMENT PRIORITY

==================================================

Build the system in this order:

PHASE 1:

- Authentication

- Protected routes

- Database

- User profiles

- Roles

- Permissions

- Departments

- Admin Panel

PHASE 2:

- Employees

- Workers

- Employee profiles

- Passport

- Visa

- Documents

- Private Storage

PHASE 3:

- Expiry tracking

- Dashboard

- Notifications

- Email notifications

- Leave

PHASE 4:

- News

- Policies

- Certificates

- Licenses

- Memos

- Organization Charts

PHASE 5:

- Sales

- Marketing

- Production

- O&P

PHASE 6:

- Audit logs

- Security hardening

- Performance optimization

- Responsive optimization

- Backup/recovery considerations

Do not attempt to build everything as one giant component.

Use reusable components and modular pages.

Before building advanced modules, ensure authentication, authorization, RLS and private document storage are correctly implemented.

The final application should be production-ready, secure, maintainable and easy to expand.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aaf904cc-01a2-4e24-a311-13c323be22af).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
