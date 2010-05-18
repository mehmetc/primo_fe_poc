require 'browser'
require 'libis/search'
require 'libis/holding/primo_search_holding'
require 'libis/sfx/primo_sfx_data'
require 'libis/recommendation'
require 'libis/query_parser'


# UPDATE THESE
@@OPAC_HOST  = 'http://127.0.0.1/X?'
@@OPAC_BASE  = 'LBS01'
@@PRIMO_HOST = 'http://127.0.0.1:1701'
@@BXRecommendationToken   = '12345678901234567890'
# UPDATE THESE



@@PrimoSearchFactory = SearchFactory.new('Primo');
@@MetalibSearchFactory = SearchFactory.new('Metalib');
@@PrimoRecommendationFactory = RecommendationFactory.new('Bx')
@@PrimoQueryParserFactory = QueryParserFactory.new('Primo')



class ActionController::Request  
  def user_agent_info
    UserAgentInfo::UserAgent.new(self)       
  end
end
