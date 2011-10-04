module ElementsHelper
  
  
  def prepare_json_data(elements, inter_element_links, belief_states)
    processed_data = {#:element_by_type    => {:node       => {:statement => [], :reference => []},
                      #                        :connection => {:single => []} 
                      #                       },
                      #:element_by_id      => {},
                      :elements             => [],
                      :inter_element_links  => [],
                      :belief_states        => []#,
                      #:inter_element_link_by_id => {}
                     }
    
    
    elements.each {|element|
      processed_data[:elements] += [element.attributes]
    }
    
    
    inter_element_links.each {|iel_link|
      processed_data[:inter_element_links] += [iel_link.attributes]
    }
    
    
    belief_states. each {|belief_state|
      processed_data[:belief_states] += [belief_state.attributes]
    }
    
    
    return processed_data
  end
  
  
end
