const fp = require('fastify-plugin');
const { applyOperation, getChanges } = require('../lib/syncStore-pg');
const sockets = require('../sockets');

async function syncRoutes(fastify, opts) {
  fastify.post('/ops', async (request, reply) => {
    const ops = Array.isArray(request.body && request.body.ops) ? request.body.ops : [];
    const results = [];
    for (const op of ops) {
        try {
          const r = await applyOperation(op);
          results.push({ op_id: op.op_id, success: true, version: r.version });
          // emit an immediate change event to connected clients if sockets are initialized
          try {
            const io = sockets.getIo();
            if (io) {
              io.emit('change', { object_type: op.object_type, object_id: op.object_id, op_id: op.op_id, operation: op.operation, version: r.version });
            }
          } catch (e) {
            // non-fatal
          }
        } catch (e) {
          results.push({ op_id: op.op_id, success: false, error: String(e) });
        }
      }
    return { results };
  });

  fastify.get('/changes', async (request, reply) => {
    const since = Number(request.query.since || 0);
    const limit = Math.min(1000, Number(request.query.limit || 100));
    const rows = await getChanges(since, limit);
    return { changes: rows };
  });
}

module.exports = fp(syncRoutes);
