class SfxDataController < ApplicationController
  def create
    url = params['url']
    result = {}
    options = {}

    data = url.split('?')
    query = data[1]
    @parameters= {}
    parameters= query.split('&')
    parameter_pairs= parameters.map {|p| p.split('=')}
    parameter_pairs.each {|k, v| @parameters[k]= v}
    getFullText = PrimoSfxData.new(url, request.remote_addr, @parameters)
    result = getFullText.query

    respond_to do |wants|
      wants.html { render :text => 'This is not implemented. Make sure your header is set to "application/json" ' }
      wants.json { render :json => result.to_json }
    end
  end
end
