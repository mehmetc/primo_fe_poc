class Result < ActiveRecord::Base
  belongs_to :query
  has_many :result_data
end
