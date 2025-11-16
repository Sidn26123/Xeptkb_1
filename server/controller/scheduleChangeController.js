const {
  createRequest,
  listRequests,
  getRequestById,
  approveRequest,
  applyRequest,
  rejectRequest
} = require('../services/scheduleChangeService');
const { SuccessResponse, ErrorResponse } = require('../utils/responseUtils');

// POST /api/v1/schedule-change-requests
exports.create = async (req, res) => {
  try {
    const payload = req.body;
    const user = req.user || { id: req.body.requested_by_user_id, role: req.body.requested_by_role };
    const r = await createRequest(payload, user);
    res.status(201).json(new SuccessResponse(r, 'Request created', 201));
  } catch (err) {
    console.error('create schedule change error', err);
    res.status(400).json(new ErrorResponse(err.message || 'Bad Request', 400));
  }
};

// GET /api/v1/schedule-change-requests
exports.list = async (req, res) => {
  try {
    const filters = req.query || {};
    const rows = await listRequests(filters);
    res.status(200).json(new SuccessResponse(rows, 'OK'));
  } catch (err) {
    console.error('list schedule change error', err);
    res.status(500).json(new ErrorResponse(err.message || 'Server error', 500));
  }
};

// GET /api/v1/schedule-change-requests/:id
exports.getById = async (req, res) => {
  try {
    const r = await getRequestById(req.params.id);
    res.status(200).json(new SuccessResponse(r, 'OK'));
  } catch (err) {
    console.error('getById schedule change error', err);
    res.status(404).json(new ErrorResponse(err.message || 'Not found', 404));
  }
};

// POST /api/v1/schedule-change-requests/:id/approve
exports.approve = async (req, res) => {
  try {
    const id = req.params.id;
    const adminUser = req.user;
    const updates = req.body || {};
    const r = await approveRequest(id, adminUser, updates);
    res.status(200).json(new SuccessResponse(r, 'Approved'));
  } catch (err) {
    console.error('approve schedule change error', err);
    res.status(400).json(new ErrorResponse(err.message || 'Bad request', 400));
  }
};

// POST /api/v1/schedule-change-requests/:id/apply
exports.apply = async (req, res) => {
  try {
    const id = req.params.id;
    const adminUser = req.user;
    const result = await applyRequest(id, adminUser);
    res.status(200).json(new SuccessResponse(result, 'Applied'));
  } catch (err) {
    console.error('apply schedule change error', err);
    res.status(400).json(new ErrorResponse(err.message || 'Bad request', 400));
  }
};

// POST /api/v1/schedule-change-requests/:id/reject
exports.reject = async (req, res) => {
  try {
    const id = req.params.id;
    const adminUser = req.user;
    const reason = req.body.reason || null;
    const r = await rejectRequest(id, adminUser, reason);
    res.status(200).json(new SuccessResponse(r, 'Rejected'));
  } catch (err) {
    console.error('reject schedule change error', err);
    res.status(400).json(new ErrorResponse(err.message || 'Bad request', 400));
  }
};

module.exports = exports;
