# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_limo_session',
  :secret      => '1858ebe7abf63a1d5dc3b31d63702a46a131c45791337bbb99f72263113f2284c7f8b9bf4604c9a95a8ef231fc0802112b38d4b74098734ccc6d36dd969d89b3'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
ActionController::Base.session_store = :active_record_store
