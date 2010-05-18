class UpgradeBrowserController < ApplicationController
  def index
    @upgrade = false
    puts request.headers['HTTP_USER_AGENT']    
    if request.user_agent_info.isIE_or_worse?('6.0')
        @upgrade = true
    end    
  end
end