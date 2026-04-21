# GPT TESTING HANDOFF: OPS KAIMANA

## A. Live URL
**URL**: [https://ops-kaimana.web.app](https://ops-kaimana.web.app)

## B. Fixed Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin.ops@kaimana.com` | `Admin@123` |
| **Operator** | `operator.ops@kaimana.com` | `Operator@123` |
| **Buyer** | `buyer.ops@kaimana.com` | `Buyer@123` |

## C. Roles & Permissions
*   **Admin**: Full access. Can manage users, master data, and all operational flows.
*   **Operator**: Operational access. Can perform receiving, processing, and sales. Cannot access User Management.
*   **Buyer**: Restricted access. Can view stock and specific buyer-related data. Blocked from Admin/Operator areas.

## D. Test Flows for GPT Agent
1.  **Login Verification**: Log in with each user and verify the landing page.
2.  **Role Restriction Check**:
    *   As **Operator**, try to navigate to `/users`. It should be blocked or redirected.
    *   As **Buyer**, try to navigate to `/receiving` or `/users`. It should be blocked.
3.  **Master Data**: Verify that Products, Suppliers, and Customers can be viewed/edited by Admin.
4.  **Operational Flow**:
    *   **Receiving**: Create a draft receiving record, add items, and post.
    *   **Stock**: Verify the items appear in the Stock list.
    *   **Processing**: Create a processing batch from existing stock.
    *   **Sales/Dispatch**: Create a sales order and verify stock reduction.
5.  **Reports**: Check the Inventory and Sales reports for correct data.
6.  **Print Preview**: Open a receiving or sales record and verify the print layout.

## E. Expected Results
*   **Session Persistence**: Refreshing the page should keep the user logged in.
*   **Logout**: Clicking logout should return the user to the login screen and clear the session.
*   **No Infinite Spinners**: Protected routes should load promptly or show an "Access Denied" message.

## F. Final Statement
**READY FOR GPT AGENT TESTING: YES**
