const jwt = require('jsonwebtoken');
module.exports = function(req,res,next){
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.split(' ')[1];
  if(!token) return res.status(401).json({msg:'No token'});
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
    next();
  }catch(err){
    return res.status(403).json({msg:'Invalid token'});
  }
}
