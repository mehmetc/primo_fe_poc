class Dataset < ActiveRecord::Base
  has_many :dataset_restrictions
  has_many :queries
  
  def self.find_by_string(param = "")
    dataset_type = {'local' => 'LocalDataset', 'remote' => 'RemoteDataset'}
    db_param = param.split(',')
    
    type = db_param[0]
    name = db_param[1]
    
    Dataset.find(:first, :conditions => ['type = ? and name = ?', dataset_type[type], name])    
  end
  
  def self.find_default
    Dataset.find(:first, :conditions => ["type = 'LocalDataset' and name = 'KUL'"])    
  end
  
  def to_s
    case self.class.to_s
    when 'LocalDataset'
      return "local,#{self.name}"
    when 'RemoteDataset'
      return "remote,#{self.name}"      
    end        
  end
  
  def is_remote?
    self.class.to_s.eql?('RemoteDataset')
  end
  
end
