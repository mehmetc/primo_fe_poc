class Session < ActiveRecord::Base
  has_many :queries
end
