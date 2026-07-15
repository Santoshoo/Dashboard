# KIMS ICT Movement Register User Manual

This manual explains how a new user will use the website and what an Admin will do. Add the screenshots exactly at the places marked as **Screenshot Needed**.

## 1. Website Users And Roles

| Role | Who uses it | What they can do |
|---|---|---|
| New User / Staff | Any staff using the public dashboard | Select location, create a movement entry, and view who is currently out. |
| Admin | Authorized department admin | Login, monitor active movements, mark returns, add extra locations, manage employees, view/export records. |
| Super Admin | Main system admin | Everything an Admin can do, plus create/edit/delete Admin accounts. |

## 2. New User Guide

### Step 1: Open The Website

Open the dashboard website. The home page shows the movement dashboard.

The user can see:

- Location selection
- Current date and time
- New Movement button
- Currently out employee list
- Archive button
- Admin login button

**Screenshot Needed 1: Dashboard Home Page**

Place the screenshot after this step. Capture the full dashboard screen.

### Step 2: Select The Correct Location

The user must select the correct location before making an entry:

- `IT DATA CENTER`
- `IT COMMAND CENTER`

This is important because the employee list changes based on the selected location.

**Screenshot Needed 2: Location Selection**

Place the screenshot after this step. Highlight or crop the location buttons.

### Step 3: Create A New Movement Entry

To record that an employee is going out:

1. Click **New Movement**.
2. Search and select the employee name.
3. Select the person/manager informed in **Inform To**.
4. Select the visit location.
5. If the location or informed person is not listed, choose **Others** and type the value.
6. Enter the purpose of visit.
7. Submit the form.

After submission, the employee will appear in the currently out list.

**Screenshot Needed 3: New Movement Form**

Place the screenshot after this step. Capture the form/drawer after clicking **New Movement**.

**Screenshot Needed 4: Employee Search Dropdown**

Place the screenshot after the line explaining employee selection. Capture the dropdown while searching an employee.

**Screenshot Needed 5: Filled Movement Form**

Place the screenshot before the submit instruction. Use dummy/sample data only.

### Step 4: Check Currently Out Employees

After a movement is submitted, the employee appears in the active/currently out section.

The list shows:

- Employee name
- Informed person
- Out time
- Destination
- Purpose
- Time duration / TAT

If a person is out for a long time, the dashboard highlights the record for attention.

**Screenshot Needed 6: Currently Out List**

Place the screenshot after this step. Capture at least one active movement record.

### Step 5: View Previous Records

Click **Archive** to view completed movement records.

The Archive page shows:

- Employee name
- Informed person
- Out time
- Return time
- TAT
- Destination
- Purpose

The user can search records and filter by date.

**Screenshot Needed 7: Archive Page**

Place the screenshot after this step. Capture the archive table and filter area.

### Step 6: Change Theme

The user can click the sun/moon icon to switch between dark mode and light mode.

**Screenshot Needed 8: Light/Dark Theme Button**

Place the screenshot after this step. Capture the theme button or one page in light mode.

## 3. Admin Guide

### Step 1: Open Admin Login

The Admin can login by clicking **Admin** on the dashboard or opening `/admin`.

**Screenshot Needed 9: Admin Login Page**

Place the screenshot after this step. Capture the login page with Administrator ID and Security Key fields.

### Step 2: Login As Admin

The Admin enters:

1. Administrator ID
2. Security Key / password
3. Clicks **Authorize Master Access**

After successful login, the Admin is redirected to the dashboard.

**Screenshot Needed 10: Admin Login Filled**

Place the screenshot after this step. Use dummy credentials, not real credentials.

### Step 3: Understand The Admin Dashboard

After login, the Admin dashboard shows extra controls.

An Admin can:

- View active movements for the assigned location
- Mark an employee as returned
- Add another location to an active movement
- Open Employee Master
- Open Archive
- Export records to Excel
- Delete incorrect completed records
- Logout

Normal Admin users are limited to their assigned location. Super Admin users can see all locations.

**Screenshot Needed 11: Admin Dashboard**

Place the screenshot after this step. Capture the dashboard after Admin login with admin buttons visible.

### Step 4: Mark Employee Return

When an employee comes back:

1. Admin finds the employee in the currently out list.
2. Admin clicks **Return**.
3. The active movement closes and moves to Archive.

**Screenshot Needed 12: Return Button**

Place the screenshot after this step. Capture an active record with the **Return** button visible.

### Step 5: Add Another Location For An Active Movement

Sometimes an employee may go to another place before returning.

Admin can update the active route:

1. Click the add location/map action on the active movement.
2. Select the new location.
3. Enter the new purpose.
4. Submit the form.

The movement timeline will show the route history.

**Screenshot Needed 13: Add New Location Popup**

Place the screenshot after this step. Capture the popup/modal with new location and purpose fields.

**Screenshot Needed 14: Movement Timeline**

Place the screenshot after the route history explanation. Capture an expanded timeline.

### Step 6: Manage Employee Master

Admin opens **Employee Master** from the dashboard.

Admin can:

- Add a new employee
- Enter employee ID
- Enter employee name
- Assign location/department
- Search existing employees
- Activate or deactivate employees

If an employee is inactive, that employee will not be available for new movement entries.

**Screenshot Needed 15: Employee Master Window**

Place the screenshot after this step. Capture the full Employee Master window.

**Screenshot Needed 16: Add Employee Section**

Place the screenshot after the add employee explanation. Capture Employee ID, Full Name, and Assign Location fields.

**Screenshot Needed 17: Active/Inactive Employee Button**

Place the screenshot after the activate/deactivate explanation. Capture the employee status button.

### Step 7: View And Filter Archive

Admin clicks **Archive** to view completed records.

Admin can:

- Search by employee name or manager name
- Filter by start date and end date
- View TAT
- Export records to Excel
- Delete incorrect records

**Screenshot Needed 18: Admin Archive Page**

Place the screenshot after this step. Capture the archive page with filters and records.

**Screenshot Needed 19: Export Excel Button**

Place the screenshot after the export explanation. Capture the **Export Excel** button.

**Screenshot Needed 20: Delete Record Button**

Place the screenshot after the delete explanation. Capture the trash/delete icon in the Actions column.

### Step 8: Logout

After completing work, Admin should click **Logout**.

**Screenshot Needed 21: Logout Button**

Place the screenshot after this step. Capture the logout button on the Admin dashboard.

## 4. Super Admin Guide

Super Admin has all Admin permissions and can also manage Admin accounts.

### Step 1: Open Admin Management

After Super Admin login, click **Admin Management**.

Only Super Admin can open this page.

**Screenshot Needed 22: Admin Management Button**

Place the screenshot after this step. Capture the dashboard with **Admin Management** visible.

### Step 2: Create A New Admin Account

In Admin Management, Super Admin can create a new Admin:

1. Enter First Name.
2. Enter Last Name.
3. Enter Employee ID.
4. Select Assigned Location.
5. Enter Security Key.
6. Confirm Security Key.
7. Click **Create Admin Account**.

**Screenshot Needed 23: Create Admin Form**

Place the screenshot after this step. Capture the new admin form with dummy values.

### Step 3: View Registered Admins

The right side of the page shows all registered Admin accounts.

The table shows:

- Name
- Employee ID
- Location
- Role
- Edit/Delete actions

**Screenshot Needed 24: Registered Admin List**

Place the screenshot after this step. Capture the admin table.

### Step 4: Edit An Admin

To update an Admin:

1. Click the edit icon.
2. Update name, employee ID, or assigned location.
3. Click **Save Changes**.

**Screenshot Needed 25: Edit Admin Mode**

Place the screenshot after this step. Capture the form in edit mode.

### Step 5: Delete An Admin

To remove a normal Admin:

1. Click the delete icon.
2. Confirm the delete message.

Super Admin should not delete important Admin accounts unless required.

**Screenshot Needed 26: Delete Admin Button**

Place the screenshot after this step. Capture the delete icon in the admin table.

## 5. Password Reset

If an Admin forgets the password:

1. Open `/admin`.
2. Click **Reset Password?**
3. Enter Admin Employee ID.
4. Enter new Security Key.
5. Confirm the Security Key.
6. Submit the request.

**Screenshot Needed 27: Reset Password Page**

Place the screenshot after this section. Capture the reset password form with dummy data only.

## 6. Screenshot Checklist

| No. | Screenshot Name | Where to place it |
|---:|---|---|
| 1 | Dashboard Home Page | New User Step 1 |
| 2 | Location Selection | New User Step 2 |
| 3 | New Movement Form | New User Step 3 |
| 4 | Employee Search Dropdown | New User Step 3 |
| 5 | Filled Movement Form | New User Step 3 |
| 6 | Currently Out List | New User Step 4 |
| 7 | Archive Page | New User Step 5 |
| 8 | Light/Dark Theme Button | New User Step 6 |
| 9 | Admin Login Page | Admin Step 1 |
| 10 | Admin Login Filled | Admin Step 2 |
| 11 | Admin Dashboard | Admin Step 3 |
| 12 | Return Button | Admin Step 4 |
| 13 | Add New Location Popup | Admin Step 5 |
| 14 | Movement Timeline | Admin Step 5 |
| 15 | Employee Master Window | Admin Step 6 |
| 16 | Add Employee Section | Admin Step 6 |
| 17 | Active/Inactive Employee Button | Admin Step 6 |
| 18 | Admin Archive Page | Admin Step 7 |
| 19 | Export Excel Button | Admin Step 7 |
| 20 | Delete Record Button | Admin Step 7 |
| 21 | Logout Button | Admin Step 8 |
| 22 | Admin Management Button | Super Admin Step 1 |
| 23 | Create Admin Form | Super Admin Step 2 |
| 24 | Registered Admin List | Super Admin Step 3 |
| 25 | Edit Admin Mode | Super Admin Step 4 |
| 26 | Delete Admin Button | Super Admin Step 5 |
| 27 | Reset Password Page | Password Reset section |

## 7. Screenshot Tips

- Use test data only.
- Do not show real passwords.
- Hide or blur confidential employee IDs if needed.
- Keep browser zoom at 100%.
- Use full-page screenshots for main pages.
- Use cropped screenshots for buttons, forms, and small actions.
