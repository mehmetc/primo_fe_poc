#ENV["RAILS_ENV"] = "development"
require File.expand_path(File.dirname(__FILE__) + "/../../config/environment")

require 'activerecord'

require 'libis/search'

task :reload_rdb do
    mlsf = SearchFactory.new('Metalib')
    metalib = mlsf.new_search
    session_id =  metalib.retrieve_session_id('KUL', 'Uaka2me')
    
    unless session_id.nil?
      RemoteDataset.destroy_all
      metalib.retrieve_sets(session_id, :source_id => 'KUL', :verification => 'KUL', :institute => 'KUL').each do |rdb|
        unless rdb[:name].eql?('Clipboard')
          RemoteDataset.create(:label => rdb[:name].humanize, :name => rdb[:name], :description => rdb[:description], :load => 10)                
        end
      end
    end
end