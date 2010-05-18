class Query < ActiveRecord::Base
  validates_presence_of :query_terms, :on => :create, :message => "can't be blank"
  
  belongs_to :user
  belongs_to :session
  belongs_to :database, :class_name => "Dataset", :foreign_key => "database_id"
  has_many :query_terms
  has_many :filter_terms
  has_many :results
  
    def primo(from, options = {})
#        queue = ReliableMsg::Queue.new('Primo')

        options.each do |k,v|
          options.delete(k)
          options.store(k.to_s, v)
        end
      
        result = nil
        search = @@PrimoSearchFactory.new_search 
                                        
        begin    
          
          if self.database.is_remote?
            result = search.query(all_query_terms, all_filter_terms, :from => from, :step => self.database[:load], :host => @@PRIMO_HOST, 
                                  :ip => options['ip'], :more => 1, :location => self.database.to_s, :raw => options['raw'] || false)              
          else 
            result = search.query(all_query_terms, all_filter_terms, :from => from, :step => self.database[:load], 
                                  :host => @@PRIMO_HOST, :raw => options['raw'] || false)
          end
          unless options['raw']
            self.total_records = result[:records][:total] 
            self.save!
          end
        rescue Exception => e
          return {'error' => e.message}
        end
#        message = {:data => result, :query_id => self.id}
#        queue.put message
        return result
    end      
    
    def all_itm
      itm = []
      itm += all_query_terms
      fts = all_filter_terms
      fts.each do |ft|        
        if ft["index"].eql?('facet_creationdate')          
          ft["term"] = ft["term"].gsub('-999999999', '...')
          ft["term"] = ft["term"].gsub('null', '...')
        end
      end
      itm += fts
      
      itm
    end
    
    def all_query_terms
      itm = []
      self.query_terms.each do |qt|
        itm << {"term" => qt.term, "index" => qt.index, "match" => qt.match}
      end
      
      itm      
    end
    
    def all_filter_terms
      itm = []
      self.filter_terms.each do |ft|              
        itm << {"index" => ft.index, "term" => ft.term}
      end      
      
      itm
    end
    
    def to_s
      query = ''
      self.all_itm.each do |a|
        query += " " if query.size > 0
        match = ''
        match = '"' if a[:match].eql?('exact')
        query += "#{a['index']}:#{match}#{a['term']}#{match}"
      end
      
      return query
    end
end
