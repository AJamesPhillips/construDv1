module ApplicationHelper
  
  #Return title on a per-page basis
  def title
    base_title = "constrD"
    if @title.nil?
      base_title 
    else
      "#{base_title} #{@title}"
    end
  end
  
  
  def logo    
    image_tag("logo.png", :alt => "constrD logo", :class => "round")
  end
  
end
