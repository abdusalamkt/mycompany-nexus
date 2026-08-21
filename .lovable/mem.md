---
name: Portal build phases
description: Delivery order for the internal portal and what is already built
type: feature
---
Phase 1 (done): auth, roles/permissions data model, RLS, admin (users, roles, departments, audit, settings), dashboard.
Phase 2 (done): employees module — full-width row cards, department tabs, photo upload (private employee-photos bucket), add/edit dialog, document expiry indicators for HR/admin.
Phase 3 (done): workers module (site/trade/labour card expiries), company news (drafts + publish), policies (versioned files), documents library (private company-files bucket, visibility company/restricted/private, expiry badges), dashboard expiry feed + people counts.
Phase 4 (done): staff/worker directory for regular staff — permissions employees.view_directory and workers.view_directory (granted to employee + worker roles) read via security-definer RPCs staff_directory() / worker_directory() that return only name, code, job/trade, department, site, email, phone, status, photo. No salary, passport/visa/ID numbers or expiry dates ever reach non-HR users (enforced in DB, not just UI).
Not built yet: Sales, Marketing, Production and O&P modules (permissions exist in DB, no UI), leave management, certificates module, notifications.
Theme: primary #109c5d, text #3d3d3d, white background.
