module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'production',
  DB_URL:
    'postgres://cxdihkbcgoyzpm:0c5807cf4a085d9e30cb3b9e2d476893aa946b9dedf65cc5ef6d0533fcca9286@ec2-107-20-168-237.compute-1.amazonaws.com:5432/daov4ss2k1umqk',
  JWT_SECRET:
    process.env.JWT_SECRET || 'change-this-secret',
  CLIENT_ORIGIN:
    'https://hobby-with-friends.adrianslolacc.now.sh',
};
