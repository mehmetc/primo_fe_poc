# ############################################################################
#
# UserAgentInfo Library
# simplifies user-agent detection
#
# Mehmet Celik
# (c) 2009 Libis 
#
# ############################################################################

module UserAgentInfo
  class UserAgent
    attr_reader :browser_info

    def initialize(r)
      parse_browser_info(r)
    end

    def [](lookup)
      @browser_info[lookup]
    end

    def isIE?(version = nil)
      browser_query('MSIE', version)
    end

    def isFirefox?(version = nil)
      browser_query('Firefox', version)
    end

    def isChrome?(version = nil)
      browser_query('Chrome', version)
    end

    def isOpera?(version = nil)
      browser_query('Opera', version)
    end

# or_better or_worse
    def method_missing(method_id, *arguments, &block)
      actions = ['better', 'worse']
      operators = ['or', 'and']
      
      method = method_id.to_s
      method_name = "#{method.split('_')[0]}?"
      
      operator = method.split('_')[1]      
      action   = method.split('_')[2].chop
 
      return false if !operators.include?(operator)
      return false if !action.include?(action)      
 
      if self.send method_name.to_sym
        if arguments.size != 1
          raise RuntimeError, "Missing 'version' argument."
        end
                
        version = arguments[0].to_f
        case 
        when action.eql?("better") && operator.eql?('or')
          return @browser_info['version'] >= version
        when action.eql?("better") && operator.eql?('and')          
          return @browser_info['version'] > version        
        when action.eql?("worse") && operator.eql?('or')
          return @browser_info['version'] <= version
        when action.eql?("worse") && operator.eql?('and')          
          return @browser_info['version'] < version        
        end                  
      end
      
      return false
    end

    private
    def parse_browser_info(r)
      supported_browser = %w(MSIE Firefox Chrome Opera)
      browser_labels = {"MSIE"    => 'Microsoft Internet Explorer',
                        "Firefox" => "Mozilla Firefox",
                        "Chrome"  => "Google Chrome",
                        "Opera"   => "Opera",
                        "unknown" => "unknown"}
      
      header = platform = name = cpuos = language = engine = ''
      version = 0.0

      if r.nil?
        raise "Couldn't determine request"
      end
      header = r.headers['HTTP_USER_AGENT']

      case
      when header.match('MSIE')
        string_match = header.match('.*? \((.*?)?\)( .*)?')        
        browser = string_match[1].split(';').map {|e| e.strip}

        platform = browser[0]
        cpuos       = browser[2]        
        name_version = browser[1].split(' ')
        version = name_version[1].to_f
        name = name_version[0]
        language = ''        
      when header.match('Firefox') || header.match('Chrome') || header.match('Safari')
        string_match = header.match('.*? \((.*?)?\)( .*)?')   
        browser  = string_match[1].split(';').map {|e| e.strip}
        platform = browser[0]
        name     = browser[1]
        cpuos    = browser[2]
        language = browser[3]
                     
        name_version_engine = string_match[2].gsub(/\(.*?\)/,'').split(' ')
        name_version = name_version_engine[1].split('/')
        name         = name_version[0]
        version      = name_version[1].to_f
        engine       = name_version_engine[0]                
      when header.match('Opera')        
        string_match = header.match('(.*?) \((.*?)?\)( .*)?')        
        browser  = string_match[1].split('/').map { |e| e.strip }
        name     = browser[0]
        version  = browser[1].to_f
        browser  = string_match[2].split(';').map {|e| e.strip}
        platform = browser[0]
        cpuos    = browser[1]
        language = browser[3]
        engine   = string_match[3].strip
      else
        platform = name = cpuos = language = engine = 'unknown'        
      end

      @browser_info = {'header' => header, 'platform' => platform, 'name' => name, 'name_display' => browser_labels[name],
      'cpuos' => cpuos, 'language' => language, 'version' => version, 'engine' => engine}

      @browser_info
    end

    def browser_query(browser_name, version)
      response = false
      if @browser_info.nil?
        parse_browser_info
      end

      unless @browser_info.nil?
        if @browser_info['name'].eql?(browser_name)
          if version.nil? || version.empty?
            response = true
          else
            response = true if (@browser_info['version'] == version.to_f)
          end
        end
                
      end
      response
    end

  end
end
