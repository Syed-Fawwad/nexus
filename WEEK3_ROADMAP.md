# NEXUS PROJECT - FRONTEND INTEGRATION AUDIT & WEEK 3 ROADMAP

**Report Date:** 2026-06-19  
**Project Phase:** Pre-Week 3 Frontend Integration

---

## 1. CURRENT COMPLETION STATUS

### Overall Project: 45% Complete

| Component | Status | Completion | Notes |
|-----------|--------|------------|-------|
| **Backend Infrastructure** | ✅ Complete | 100% | MongoDB, Express, Node.js configured |
| **Authentication System** | ✅ Complete | 100% | JWT, login, register, getUserProfile |
| **User Profiles** | ⚠️ Partial | 60% | Update works, but missing GET user/list users |
| **Meeting System** | ✅ Complete | 100% | Full CRUD, tested and verified |
| **Chat System** | ✅ Complete | 100% | REST APIs + Socket.IO real-time |
| **User Discovery** | ❌ Missing | 0% | No API to browse/search users |
| **Frontend** | ❌ Not Started | 0% | No React app exists |

**Backend APIs: 90% Complete** (Missing 2-3 critical endpoints)  
**Frontend: 0% Complete** (Not started)

---

## 2. EXISTING BACKEND APIs

### Authentication (`/api/auth`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Users (`/api/users`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| PUT | `/api/users/profile` | Update own profile | Yes |

### Meetings (`/api/meetings`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/meetings` | Get all user's meetings | Yes |
| POST | `/api/meetings` | Create new meeting | Yes |
| GET | `/api/meetings/:id` | Get specific meeting | Yes |
| PUT | `/api/meetings/:id` | Update meeting | Yes |
| DELETE | `/api/meetings/:id` | Delete meeting | Yes |

### Messages (`/api/messages`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/messages/:userId` | Get conversation with user | Yes |
| POST | `/api/messages` | Send message | Yes |
| PUT | `/api/messages/read/:userId` | Mark messages as read | Yes |
| GET | `/api/messages/unread/count` | Get unread count | Yes |

### Socket.IO Events
| Event | Direction | Purpose |
|-------|-----------|---------|
| `sendMessage` | Client → Server | Send real-time message |
| `receiveMessage` | Server → Client | Receive real-time message |
| `typing` | Client → Server | User typing indicator |
| `stopTyping` | Client → Server | Stop typing indicator |
| `userTyping` | Server → Client | Receive typing notification |
| `userStoppedTyping` | Server → Client | Receive stop typing |
| `markAsRead` | Client → Server | Mark messages read |
| `messagesRead` | Server → Client | Read receipt |
| `onlineUsers` | Server → Client | List of online users |

### Health Check
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/health` | Server health check | No |

---

## 3. CRITICAL MISSING BACKEND APIs

### ❌ User Discovery/Browse System

**Required for frontend:**

1. **GET /api/users** - List all users with filtering
   - Purpose: Browse entrepreneurs/investors
   - Filters needed: role (entrepreneur/investor), industry, location
   - Exclude current user from results
   - Pagination support (optional but recommended)
   - Response: Array of user objects with basic info

2. **GET /api/users/:id** - Get specific user's public profile
   - Purpose: View another user's profile details
   - Should include role-specific profile data
   - Exclude sensitive info (email, password)
   - Response: User object with entrepreneur/investor profile

**Why these are critical:**
- Without GET /api/users, users cannot discover each other
- Without GET /api/users/:id, users cannot view profiles to decide on meetings/messages
- These are **blocking** for the core platform value proposition

---

## 4. FRONTEND PAGES/SCREENS NEEDED

### Public Pages (No Auth Required)
| Page | Route | APIs Used | Purpose |
|------|-------|-----------|---------|
| Landing | `/` | None | Marketing, CTA to login/register |
| Login | `/login` | POST /api/auth/login | User authentication |
| Register | `/register` | POST /api/auth/register | User signup |

### Protected Pages (Auth Required)
| Page | Route | APIs Used | Purpose |
|------|-------|-----------|---------|
| Dashboard | `/dashboard` | GET /api/auth/me, GET /api/meetings (recent), GET /api/messages/unread/count | Home after login, overview |
| My Profile | `/profile` | GET /api/auth/me, PUT /api/users/profile | View/edit own profile |
| Browse Users | `/browse` | **GET /api/users** ❌ MISSING | Discover entrepreneurs/investors |
| User Profile | `/users/:id` | **GET /api/users/:id** ❌ MISSING | View other user's profile |
| Meetings | `/meetings` | GET /api/meetings, POST /api/meetings | View and schedule meetings |
| Meeting Details | `/meetings/:id` | GET /api/meetings/:id, PUT /api/meetings/:id, DELETE /api/meetings/:id | Manage specific meeting |
| Messages | `/messages` | GET /api/messages/:userId, POST /api/messages, Socket.IO | Chat with users |
| Chat Conversation | `/messages/:userId` | GET /api/messages/:userId, POST /api/messages, Socket.IO | Specific conversation |

---

## 5. API COVERAGE ANALYSIS

### Pages vs Available APIs

| Page | APIs Needed | APIs Available | Status | Blocker |
|------|-------------|----------------|--------|---------|
| Landing | None | N/A | ✅ Ready | No |
| Login | POST /api/auth/login | ✅ | ✅ Ready | No |
| Register | POST /api/auth/register | ✅ | ✅ Ready | No |
| Dashboard | GET /api/auth/me, meetings, unread | ✅ | ✅ Ready | No |
| My Profile | GET /api/auth/me, PUT /api/users/profile | ✅ | ✅ Ready | No |
| **Browse Users** | **GET /api/users** | ❌ | ❌ Blocked | **YES** |
| **User Profile** | **GET /api/users/:id** | ❌ | ❌ Blocked | **YES** |
| Meetings | GET/POST /api/meetings | ✅ | ✅ Ready | No |
| Meeting Details | GET/PUT/DELETE /api/meetings/:id | ✅ | ✅ Ready | No |
| Messages | Message APIs + Socket.IO | ✅ | ✅ Ready | No |
| Chat Conversation | Message APIs + Socket.IO | ✅ | ✅ Ready | No |

**Summary:** 2 pages are blocked by missing APIs (Browse Users, User Profile View)

---

## 6. MISSING FUNCTIONALITY TO IMPLEMENT

### Priority 1: Critical (Blocking Frontend)

**A. GET /api/users - List Users API**
```javascript
// Endpoint: GET /api/users?role=investor&industry=tech
// Purpose: Browse and discover users
// Returns: Array of users with public profile data
// Features:
// - Filter by role (entrepreneur/investor)
// - Filter by industry (entrepreneur only)
// - Filter by location
// - Exclude current logged-in user
// - Return basic user info + role-specific data
```

**B. GET /api/users/:id - Get User Profile API**
```javascript
// Endpoint: GET /api/users/:id
// Purpose: View specific user's public profile
// Returns: Single user object with full profile
// Features:
// - Public profile info (no email or sensitive data)
// - Include entrepreneur/investor profile data
// - Return 404 if user not found
```

### Priority 2: Nice-to-Have (Not Blocking)
- Search functionality in GET /api/users (text search)
- Pagination in GET /api/users (limit/offset)
- User avatar upload endpoint
- Password reset functionality
- Email verification

**Decision: Implement Priority 1 only before starting frontend.**

---

## 7. WEEK 3 IMPLEMENTATION ROADMAP

### Phase 1: Complete Missing Backend APIs (Day 1)
**Estimated Time:** 2-3 hours

1. **Create getUsersController functions** (30 min)
   - `getAllUsers()` - List users with filters
   - `getUserById()` - Get specific user profile

2. **Add routes to userRoutes.js** (15 min)
   - GET /api/users
   - GET /api/users/:id

3. **Test new endpoints** (30 min)
   - Test with different role filters
   - Test user profile retrieval
   - Verify data excludes sensitive info

4. **Verify no breaking changes** (15 min)
   - Existing APIs still work
   - MongoDB queries optimized

### Phase 2: Frontend Project Setup (Day 1-2)
**Estimated Time:** 1-2 hours

1. **Create React app** (30 min)
   - Initialize with Vite/Create React App
   - Install dependencies (react-router-dom, axios, socket.io-client)
   - Set up folder structure

2. **Configure API client** (30 min)
   - Create axios instance with base URL
   - Set up JWT token interceptor
   - Create Socket.IO connection utility

3. **Set up routing** (30 min)
   - Install react-router-dom
   - Create route structure
   - Set up protected routes

### Phase 3: Authentication UI (Day 2)
**Estimated Time:** 3-4 hours

1. **Create Auth Context** (1 hour)
   - Set up React Context for auth state
   - Login/logout functions
   - Token storage (localStorage)
   - Protected route wrapper

2. **Login Page** (1 hour)
   - Form with email/password
   - Call POST /api/auth/login
   - Store token and redirect

3. **Register Page** (1.5 hours)
   - Form with name, email, password, role
   - Call POST /api/auth/register
   - Store token and redirect

4. **Basic Layout** (30 min)
   - Header/navbar component
   - Logout button
   - Basic styling

### Phase 4: Core Pages (Day 3-4)
**Estimated Time:** 6-8 hours

1. **Dashboard Page** (1.5 hours)
   - Fetch user data (GET /api/auth/me)
   - Show welcome message
   - Show unread message count
   - Show upcoming meetings

2. **My Profile Page** (2 hours)
   - Display current profile data
   - Edit form for profile fields
   - Role-specific fields (entrepreneur vs investor)
   - Call PUT /api/users/profile

3. **Browse Users Page** (2 hours)
   - Fetch users (GET /api/users)
   - Filter by role
   - Display user cards/list
   - Link to user profile

4. **User Profile View Page** (1.5 hours)
   - Fetch specific user (GET /api/users/:id)
   - Display profile details
   - Buttons: "Schedule Meeting", "Send Message"

### Phase 5: Meetings System (Day 4-5)
**Estimated Time:** 4-5 hours

1. **Meetings List Page** (1.5 hours)
   - Fetch meetings (GET /api/meetings)
   - Display upcoming/past meetings
   - Filter by status

2. **Create Meeting Modal/Form** (1.5 hours)
   - Form to create meeting
   - Select guest from users
   - Date/time picker
   - Call POST /api/meetings

3. **Meeting Details Page** (1.5 hours)
   - View meeting info
   - Accept/reject meeting
   - Update meeting status
   - Delete meeting

### Phase 6: Chat System (Day 5-6)
**Estimated Time:** 5-6 hours

1. **Messages List Page** (1.5 hours)
   - Show conversations
   - Unread indicators
   - Click to open conversation

2. **Chat Interface** (2.5 hours)
   - Message history display
   - Send message form
   - Real-time Socket.IO integration
   - Typing indicators

3. **Socket.IO Integration** (1.5 hours)
   - Connect with JWT token
   - Listen for receiveMessage
   - Emit sendMessage
   - Handle online users
   - Typing indicators

### Phase 7: Polish & Testing (Day 6-7)
**Estimated Time:** 3-4 hours

1. **Basic Styling** (2 hours)
   - Clean, professional look
   - Responsive design basics
   - Consistent color scheme

2. **Error Handling** (1 hour)
   - API error display
   - Form validation messages
   - Network error handling

3. **End-to-End Testing** (1 hour)
   - Test full user journey
   - Create account → browse users → schedule meeting → chat

---

## 8. TECHNOLOGY STACK FOR FRONTEND

### Core
- **React** (v18+) - UI framework
- **React Router DOM** (v6) - Routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication

### State Management
- **React Context API** - Auth state, user state
- (Optional: React Query for server state caching)

### Styling
- **CSS Modules** or **Tailwind CSS** (quick, utility-first)
- Focus on functionality over aesthetics initially

### Build Tool
- **Vite** (fast) or **Create React App** (standard)

---

## 9. EXACT NEXT CODING TASK

### TASK 1: Implement Missing User APIs

**File to Create:** `backend/controllers/userController.js` (modify existing)

**Functions to Add:**

```javascript
// @desc    Get all users with optional filters
// @route   GET /api/users?role=investor&industry=tech
// @access  Private
const getAllUsers = async (req, res) => {
  const { role, industry, location } = req.query;
  
  // Build query
  const query = { _id: { $ne: req.user._id } }; // Exclude current user
  
  if (role) query.role = role;
  
  const users = await User.find(query).select('-password');
  
  // Populate role-specific profiles
  const usersWithProfiles = await Promise.all(
    users.map(async (user) => {
      let profile = {};
      if (user.role === 'entrepreneur') {
        const entProfile = await EntrepreneurProfile.findOne({ user: user._id });
        if (entProfile) {
          // Apply industry filter if provided
          if (industry && entProfile.industry !== industry) return null;
          profile = entProfile.toObject();
        }
      } else if (user.role === 'investor') {
        const invProfile = await InvestorProfile.findOne({ user: user._id });
        if (invProfile) profile = invProfile.toObject();
      }
      
      return {
        id: user._id,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isOnline: user.isOnline,
        ...profile
      };
    })
  );
  
  // Filter out nulls from industry filtering
  const filteredUsers = usersWithProfiles.filter(u => u !== null);
  
  res.json(filteredUsers);
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  let profile = {};
  if (user.role === 'entrepreneur') {
    const entProfile = await EntrepreneurProfile.findOne({ user: user._id });
    if (entProfile) profile = entProfile.toObject();
  } else if (user.role === 'investor') {
    const invProfile = await InvestorProfile.findOne({ user: user._id });
    if (invProfile) profile = invProfile.toObject();
  }
  
  res.json({
    id: user._id,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isOnline: user.isOnline,
    createdAt: user.createdAt,
    ...profile
  });
};

export { updateUserProfile, getAllUsers, getUserById };
```

**File to Modify:** `backend/routes/userRoutes.js`

```javascript
import express from 'express';
import { updateUserProfile, getAllUsers, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// List all users
router.get('/', protect, getAllUsers);

// Get specific user
router.get('/:id', protect, getUserById);

// Update own profile
router.put('/profile', protect, updateUserProfile);

export default router;
```

**Testing Commands:**
```bash
# Get all users
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get users filtered by role
curl -X GET "http://localhost:5000/api/users?role=investor" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific user
curl -X GET http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 10. IMPLEMENTATION PRIORITIES

### Do First (This Session):
1. ✅ Complete this audit
2. ⏳ Implement GET /api/users
3. ⏳ Implement GET /api/users/:id
4. ⏳ Test new endpoints
5. ⏳ Verify backend is 100% complete

### Do Next (Next Session):
1. Initialize React frontend project
2. Set up routing and auth context
3. Build authentication pages (login/register)

### Avoid:
- ❌ Adding features not in the roadmap
- ❌ Over-engineering or premature optimization
- ❌ Complex styling before functionality works
- ❌ Starting Week 3 frontend before backend APIs complete

---

## 11. SUCCESS METRICS

### Backend Complete When:
- [x] Authentication APIs working
- [x] Meeting CRUD APIs working
- [x] Message/Chat APIs working
- [ ] User discovery APIs implemented ← **CURRENT TASK**
- [ ] All endpoints tested and documented

### Week 3 Complete When:
- [ ] Users can register and login
- [ ] Users can view and edit their profile
- [ ] Users can browse other users by role
- [ ] Users can view other user profiles
- [ ] Users can schedule meetings
- [ ] Users can chat in real-time
- [ ] Basic responsive UI implemented
- [ ] All features tested end-to-end

---

## 12. ESTIMATED COMPLETION TIMELINE

| Milestone | Time Estimate | Status |
|-----------|---------------|--------|
| Complete missing backend APIs | 2-3 hours | ⏳ Next |
| Frontend project setup | 1-2 hours | ⏸️ Pending |
| Authentication UI | 3-4 hours | ⏸️ Pending |
| Core pages (profile, browse) | 6-8 hours | ⏸️ Pending |
| Meetings system UI | 4-5 hours | ⏸️ Pending |
| Chat system UI | 5-6 hours | ⏸️ Pending |
| Polish and testing | 3-4 hours | ⏸️ Pending |
| **TOTAL** | **24-32 hours** | **~3-4 working days** |

---

## SUMMARY

**Current Status:** Backend 90% complete, frontend not started  
**Blocking Issue:** 2 critical user discovery APIs missing  
**Next Immediate Task:** Implement GET /api/users and GET /api/users/:id  
**Estimated Time to Backend 100%:** 2-3 hours  
**Week 3 Total Effort:** 24-32 hours (~3-4 days)

**Recommendation:** Complete the 2 missing backend endpoints NOW, then begin Week 3 frontend implementation.
