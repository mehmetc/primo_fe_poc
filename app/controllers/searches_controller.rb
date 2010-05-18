require 'base64'

class SearchesController < ApplicationController
  before_filter :preset_format, :only => :feed
  
  
  def show    
    query_id = params[:id]
    
    resultset = session.queries.find(params[:id])
    
    respond_to do |wants|
      wants.html { render :text => 'This is not implemented. Make sure your header is set to "application/json" '  }
      wants.json { render :json => @resultset.to_json}    
    end        
  end

  def create           
    query_terms = []
    filter_terms = []
    session[:session_id] #sessions are lazy in rails
    database = Dataset.find_by_string(params[:database]) || Dataset.find_default
    query_terms, filter_terms = parse_query(params[:query])

    query = Query.create(:user_ip => request.remote_addr,
                         :session_id => request.session_options[:id], 
                         :user_id => current_user,
                         :database_id => database.id,  
                         :query_terms => query_terms,
                         :filter_terms => filter_terms) 
    
    response = {:query_id => query.id}
    response = query.primo(params[:from], :ip => request.remote_addr, :raw => params[:raw])
    
        
    respond_to do |wants|
      wants.html { render :text => 'This is not implemented. Make sure your header is set to "application/json" '  }
      wants.json { response[:query] = query.all_itm; render :json => response.to_json }    
      wants.xml  { render :xml  => response }
    end        
  end
  
  def feed
    a = CGI::unescape(params[:id])
    b = Base64::decode64(a)
    c = JSON::load(b)  
    
    query_terms = []
    filter_terms = []
    session[:session_id] #sessions are lazy in rails
        
    database = Dataset.find_by_string(c['search']['database']) || Dataset.find_default
    
    query_terms_orig = c['search']['query']
    query_terms_orig.each do |qt|
      query_terms << {:index => qt['index'], :term => qt['term'], :match => qt['match']}
      
    end
        
    query_terms, filter_terms = parse_query(query_terms)
    @query = Query.create(:user_ip => request.remote_addr,
                         :session_id => request.session_options[:id], 
                         :user_id => current_user,
                         :database_id => database,  
                         :query_terms => query_terms,
                         :filter_terms => filter_terms)
    
    @page = c['page'] || 1
    @record = @page = c['page'] || 0
    @from = ((@page - 1) * 10) + @record
    @response = {:query_id => @query.id}
    @response = @query.primo(@from, c['search']['remote'].eql?('true') || false, :ip => request.remote_addr, :raw => false)
          
    respond_to do |wants|
      wants.atom
    end        
  end
  
private 
  def preset_format
    request.format = :atom
  end
end