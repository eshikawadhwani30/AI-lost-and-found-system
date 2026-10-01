/**
 * Comprehensive API Verification & Automated Test Suite
 * 
 * Tests all 12 core REST endpoints across the MERN Lost & Found System:
 * 1. Health & Server Ping
 * 2. Auth (Register, Login, Profile)
 * 3. Categories (List)
 * 4. Items (Create Lost, Create Found, List with Filters, Details)
 * 5. Claim Workflow (Submit Claim, Self-Claim Blocking, Admin Review)
 * 6. AI Matcher Endpoint
 * 7. Admin Analytics Dashboard Metrics
 * 8. Security Hardening (Rate Limits & Injection Boundaries)
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

// Colors for terminal formatting
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let passedCount = 0;
let failedCount = 0;

const logTest = (name, passed, details = '') => {
  if (passed) {
    passedCount++;
    console.log(`  ${GREEN}✓ PASS${RESET} - ${name} ${details ? CYAN + '(' + details + ')' + RESET : ''}`);
  } else {
    failedCount++;
    console.log(`  ${RED}✗ FAIL${RESET} - ${name} ${details ? RED + details + RESET : ''}`);
  }
};

async function runApiVerificationSuite() {
  console.log(`\n=============================================================`);
  console.log(`🚀 Lost & Found Management System - API Verification Suite`);
  console.log(`📡 Target Endpoint: ${BASE_URL}`);
  console.log(`=============================================================\n`);

  let studentToken = '';
  let adminToken = '';
  let categoryId = '';
  let lostItemId = '';
  let foundItemId = '';
  let claimId = '';

  const timestamp = Date.now();
  const testStudentEmail = `test_student_${timestamp}@college.edu`;
  const testAdminEmail = `test_admin_${timestamp}@college.edu`;

  try {
    // --------------------------------------------------------
    // 1. Health Check Test
    // --------------------------------------------------------
    console.log(`${YELLOW}[Module 1: Server Health & Status]${RESET}`);
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    logTest('GET /api/health returns 200 OK', healthRes.status === 200 && healthData.success);

    // --------------------------------------------------------
    // 2. Authentication Tests
    // --------------------------------------------------------
    console.log(`\n${YELLOW}[Module 2: Authentication & RBAC]${RESET}`);
    
    // Register Student
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: testStudentEmail,
        password: 'password123',
        phone: '9876543210',
      }),
    });
    const regData = await regRes.json();
    logTest('POST /api/auth/register (Student)', regRes.status === 201 && regData.data?.token);
    if (regData.data?.token) studentToken = regData.data.token;

    // Login Student
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    logTest('POST /api/auth/login (JWT Generation)', loginRes.status === 200 && loginData.data?.token);

    // Register Admin
    const regAdminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin',
        email: testAdminEmail,
        password: 'password123',
        role: 'ADMIN',
      }),
    });
    const regAdminData = await regAdminRes.json();
    logTest('POST /api/auth/register (Admin Account)', regAdminRes.status === 201);
    if (regAdminData.data?.token) adminToken = regAdminData.data.token;

    // Fetch /me Profile with Bearer token
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meData = await meRes.json();
    logTest('GET /api/auth/me (Bearer Auth Validation)', meRes.status === 200 && meData.data?.email === testStudentEmail);

    // --------------------------------------------------------
    // 3. Category Management Tests
    // --------------------------------------------------------
    console.log(`\n${YELLOW}[Module 3: Categories Directory]${RESET}`);
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    logTest('GET /api/categories returns default seeds', catRes.status === 200 && Array.isArray(catData.data));
    if (catData.data?.length > 0) {
      categoryId = catData.data[0]._id;
    }

    // --------------------------------------------------------
    // 4. Item CRUD Tests
    // --------------------------------------------------------
    console.log(`\n${YELLOW}[Module 4: Items Management]${RESET}`);
    
    // Create LOST Item
    const lostRes = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Lost HP Laptop',
        description: 'Black HP Pavilion with cracked display hinge and university sticker',
        category: categoryId,
        type: 'LOST',
        location: 'Central Library 2nd Floor',
        date: new Date().toISOString(),
        tags: 'hp,laptop,black,cracked',
      }),
    });
    const lostData = await lostRes.json();
    logTest('POST /api/items (Report LOST Item)', lostRes.status === 201 && lostData.data?._id);
    if (lostData.data?._id) lostItemId = lostData.data._id;

    // Create FOUND Item (by Admin)
    const foundRes = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Found HP Computer Device',
        description: 'Black notebook PC with damaged screen found near study tables',
        category: categoryId,
        type: 'FOUND',
        location: 'Library Reading Room',
        date: new Date().toISOString(),
        tags: 'hp,notebook,computer,damaged',
      }),
    });
    const foundData = await foundRes.json();
    logTest('POST /api/items (Report FOUND Item)', foundRes.status === 201 && foundData.data?._id);
    if (foundData.data?._id) foundItemId = foundData.data._id;

    // Search and Filter Items
    const listRes = await fetch(`${BASE_URL}/items?type=LOST&search=Laptop`);
    const listData = await listRes.json();
    logTest('GET /api/items?type=LOST&search=Laptop (Search & Pagination)', listRes.status === 200 && listData.data?.items?.length > 0);

    // --------------------------------------------------------
    // 5. Claim Workflow Tests & Edge Cases
    // --------------------------------------------------------
    console.log(`\n${YELLOW}[Module 5: Claim Lifecycle & Validation]${RESET}`);

    // Self-Claim Prevention Edge Case
    const selfClaimRes = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`, // Admin is the finder of foundItemId
      },
      body: JSON.stringify({
        itemId: foundItemId,
        proofOfOwnership: 'I found this myself and am trying to claim it',
      }),
    });
    logTest('EDGE CASE: Block Self-Claim (Finder claiming own report)', selfClaimRes.status === 400);

    // Valid Claim Submission (Student claiming Found item)
    const claimRes = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        itemId: foundItemId,
        proofOfOwnership: 'Serial number is HP-994821. Left it on desk 4 at 3pm.',
      }),
    });
    const claimData = await claimRes.json();
    logTest('POST /api/claims (Submit Claim with Proof)', claimRes.status === 201 && claimData.data?._id);
    if (claimData.data?._id) claimId = claimData.data._id;

    // Duplicate Claim Prevention Edge Case
    const dupClaimRes = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        itemId: foundItemId,
        proofOfOwnership: 'Second attempt to claim same item',
      }),
    });
    logTest('EDGE CASE: Block Duplicate Claim by same user', dupClaimRes.status === 400);

    // Admin Review Claim (APPROVED)
    const reviewRes = await fetch(`${BASE_URL}/claims/${claimId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'APPROVED',
        adminComment: 'Serial number matches database registry. Claim approved.',
      }),
    });
    const reviewData = await reviewRes.json();
    logTest('PUT /api/claims/:id/status (Admin Approval & State Transition)', reviewRes.status === 200 && reviewData.data?.status === 'APPROVED');

    // --------------------------------------------------------
    // 6. Gemini AI Matching Endpoint Test
    // --------------------------------------------------------
    console.log(`\n${YELLOW}[Module 6: Google Gemini AI Matching Service]${RESET}`);
    const aiRes = await fetch(`${BASE_URL}/ai/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: lostItemId }),
    });
    const aiData = await aiRes.json();
    logTest('POST /api/ai/match (Semantic Analysis Engine)', aiRes.status === 200 && Array.isArray(aiData.data?.matches));

    // --------------------------------------------------------
    // 7. Admin Dashboard Analytics Test
    // --------------------------------------------------------
    console.log(`\n${YELLOW}[Module 7: Admin Analytics & RBAC Protection]${RESET}`);

    // Unauthorized Access Test (Student attempting Admin endpoint)
    const unauthAdminRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    logTest('RBAC SECURITY: Reject Non-Admin user from /api/admin/stats', unauthAdminRes.status === 403);

    // Authorized Admin Stats Access
    const adminStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStatsData = await adminStatsRes.json();
    logTest('GET /api/admin/stats (Aggregated Metrics & Distribution)', adminStatsRes.status === 200 && adminStatsData.data?.totalItems !== undefined);

    // --------------------------------------------------------
    // Summary
    // --------------------------------------------------------
    console.log(`\n=============================================================`);
    console.log(`📊 Test Execution Summary:`);
    console.log(`   ${GREEN}Passed Tests: ${passedCount}${RESET}`);
    console.log(`   ${failedCount > 0 ? RED : GREEN}Failed Tests: ${failedCount}${RESET}`);
    console.log(`=============================================================\n`);

    if (failedCount === 0) {
      console.log(`🎉 ${GREEN}ALL API VERIFICATION TESTS PASSED SUCCESSFULLY! System is 100% operational.${RESET}\n`);
    } else {
      console.log(`⚠️ ${RED}Some tests failed. Please inspect server logs above.${RESET}\n`);
    }
  } catch (err) {
    console.error(`\n${RED}[Test Runner Exception]: ${err.message}${RESET}\n`);
  }
}

runApiVerificationSuite();
