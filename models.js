var mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
mongoose.connect(connect);

var userSchema = mongoose.Schema({
  country: String,
  display_name: String,
  email: String,
  external_urls: Object,
  followers: Object,
  href: String,
  id: String,
  images: [
    String
  ],
  product: String,
  type: String,
  uri: String,
  access: String,
  refresh: String
})

User = mongoose.model('User', userSchema)

module.exports = {
  User
}
