# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  def build_url(record, i=1, page=1)
    result  = {}
    queries = []
    result.store(:page, page)
    result.store(:view, 'full')
    result.store(:record, i)
    result.store(:search, {:type => 'simple', :database => @query.database.to_s})
    
    @query.query_terms.each do |qt|
      queries << {:term => qt[:term], :index => qt[:index], :match => qt[:match]}
    end

    @query.filter_terms.each do |qt|
      queries << {:term => qt[:term], :index => qt[:index], :match => qt[:match]}
    end
    
    result.store(:search, {:query => queries})
    
    result_b64 = Base64::encode64(result.to_json)
    result_escaped = CGI::escape(result_b64)        
    
    url = "#{request.url.split('/')[0]}/#context=#{result_escaped}"
  end
end