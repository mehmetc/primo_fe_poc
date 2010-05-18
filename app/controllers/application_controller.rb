# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  protect_from_forgery # See ActionController::RequestForgeryProtection for details

  # Scrub sensitive parameters from your log
  # filter_parameter_logging :password

  def current_user
    User.find_by_username('guest')
  end


  def parse_query(qt)
    query_terms = []
    filter_terms = []
    
    if qt.is_a?(Array)
       i = 0
       qt.each do |q|
         query_term, filter_term = process_query_filter(q, i)
         query_terms << query_term unless query_term.nil?
         filter_terms << filter_term unless filter_term.nil?                  
         i += 1
       end
    elsif qt.is_a?(Hash)
       if qt.size > 0
         qt.each do |k, v|
           query_term, filter_term = process_query_filter(v)
           query_terms << query_term unless query_term.nil?
           filter_terms << filter_term unless filter_term.nil?                    
         end
       else
         query_term, filter_term = process_query_filter(qt)
         query_terms << query_term unless query_term.nil?
         filter_terms << filter_term unless filter_term.nil?                  
       end
    elsif qt.is_a?(String)      
       p = @@PrimoQueryParserFactory.new_query_parser
       queries = p.parse(qt)
       
       i = 0
       queries.each do |q|
         query_term, filter_term = process_query_filter(q, i)
         query_terms << query_term unless query_term.nil?
         filter_terms << filter_term unless filter_term.nil?         
         i += 1
       end       
    end
    
    return query_terms, filter_terms
  end
  
  def process_query_filter(qf, i = 0)
    query_term  = nil
    filter_term = nil
    
    filter_match = qf[:index].match(/facet_(.*)/)
    if filter_match.nil?
      query_term = QueryTerm.create(:term => qf[:term], :index => qf[:index], :match => qf[:match], :sequence => i)           
    else
      facet = filter_match[1]
      refinement = qf[:term]
      if facet.eql?('creationdate')
        refinement.gsub!(/^\[\.\.\./, '[-999999999')
        refinement.gsub!(/\.\.\.\]$/, 'null]')                      
      end
                 
      filter_term = FilterTerm.create(:term => refinement, :match => 'contains', :index => qf[:index], :sequence => i)            
    end    
    
    return query_term, filter_term
  end
end

