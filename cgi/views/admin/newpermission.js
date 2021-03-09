/**
 * Add new permission to the database
 * @author Mitchell Sawatzky
 */

 const code = require(`${__rootname}/util/code`);
 const page = require(`${__rootname}/util/page`);
 const redirection = require(`${__rootname}/util/redirection`);
 
 module.exports.matchPaths = ['/admin/permissions/new'];
 module.exports.name = 'new_perm';
 module.exports.type = 'POST';
 
 module.exports.handle = page.requirePermission('manage_permissions', (request, cb) => {
     if (
         (!request.post.name || request.post.name.length > 20 || /[^A-Za-z_]/.test(request.post.name))
         || (!request.post.description || request.post.description.length > 255)
     ) {
         code.errorPage(request, code.BAD_REQUEST, cb);
         return;
     }
 
     request.db.do(`INSERT INTO permission_schema (perm, description) VALUES (?, ?)`, [
         request.post.name,
         request.post.description
     ], (err) => {
         if (err) {
             throw err;
         }
         redirection.found(request, '/admin/permissions', cb);
     });
 });
