class DatabasesController < ApplicationController
  def index
    database_types = {'LocalDataset' => 'local', 'RemoteDataset' => 'remote'}
    database_types.default = 'unknown'
    
    databases = {}
    datasets = Dataset.all(:order => 'label')
    
    datasets.each do |d|
      databases.store(d.name, {:type => database_types[d[:type]], :label => d.label, :description => d.description, :load => d.load})
    end
    
    respond_to do |wants|
      wants.html { render :text => 'This is not implemented. Make sure your header is set to "application/json" '  }
      wants.json { render :json => databases.to_json }    
    end            
  end
end