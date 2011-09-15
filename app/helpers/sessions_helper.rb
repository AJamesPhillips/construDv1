module SessionsHelper
  
  
  def sign_in(user)
    cookies.permanent.signed[:remember_token] = [user.id, user.salt]
    self.current_user = user  ## the purpose of the 'self.' part of this line (ch9.3.3 p17) is to make current_user available 
                              ## in both controllers and views which will use it for things such as:
                              ## '<%= current_user.name %>'  in views and 'redirect_to current_user' in controllers
  end
  
  
  def current_user=(user)
    @current_user = user
  end
  
  def current_user
    @current_user ||= user_from_remember_token
  end  
  
  def current_user?(user)    
    user == current_user  
  end
  
  
  def authenticate    
    deny_access unless signed_in?  
  end  

  
  def deny_access   
    store_location 
    redirect_to signin_path, :notice => "Please sign in to access this page."  ##   This is equivalent to:
                                                                               # flash[:notice] = "Please sign in to access this page." 
                                                                               # redirect_to signin_path
                                                                               ##  (The same construction works for the :error key, but not for :success)
  end


  
  def redirect_back_or(default)    
    redirect_to(session[:return_to] || default)    
    clear_return_to  
  end
  
  
  
  def signed_in?
    !current_user.nil?
  end
  
  def sign_out
    cookies.delete(:remember_token)    
    self.current_user = nil
  end
  

  
  
  private    
    def user_from_remember_token
      User.authenticate_with_salt(*remember_token)
    end
    
    def remember_token      
      cookies.signed[:remember_token] || [nil, nil]   
    end
    
    def store_location      
      session[:return_to] = request.fullpath    
    end    
    
    def clear_return_to      
      session[:return_to] = nil    
    end
  
  
  
end
