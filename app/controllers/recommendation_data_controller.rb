class RecommendationDataController < ApplicationController
  def create
    result = []
    options = {}
    recommendation = @@PrimoRecommendationFactory.new_recommendation
    
    url = params['url']
    
    if url
      data = url.split('?')
      data[1].split('&').each do |d|
        
        if d.match(/rft\./)
          query_data = d.split('=')
          options.store(query_data[0], query_data[1])
        end
      end
      result = recommendation.query(@@BXRecommendationToken, options)      
    end
        
    
    respond_to do |wants|
      wants.html { render :text => 'This is not implemented. Make sure your header is set to "application/json" ' }
      wants.json { render :json => result.to_json }
    end
  end
end
