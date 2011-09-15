module ElementsHelper
  
  
  def prepare_json_data(elements, inter_element_links)
    processed_data = {#:element_by_type    => {:node       => {:statement => [], :reference => []},
                      #                        :connection => {:single => []} 
                      #                       },
                      #:element_by_id      => {},
                      :elements           => [],
                      :inter_element_links => []#,
                      #:inter_element_link_by_id => {}
                     }
    
    elements.each {|element|
=begin
    #  type = element[:element_type].to_sym
    #  subtype = element[:subtype].to_sym
    #  processed_data[:element_by_type][type][subtype] += [element.attributes]
      processed_data[:element_by_id][element.id.to_s.to_sym] = element.attributes
      processed_data[:element_by_id]["size?"] = elements.length
=end
      processed_data[:elements] += [element.attributes]
    }

    
    inter_element_links.each {|iel_link|
      processed_data[:inter_element_links] += [iel_link.attributes]

=begin      
      ## store values in :inter_element_link_by_id hash   ##@TODO   I know this is shit, because it's N**2, however it's either N**2 here or in client side .js... until there's a proper Relational database implemented client side.
      
      ##first check if element1_id is stored already,
      id_already_stored = processed_data[:inter_element_link_by_id][iel_link.element1_id.to_s.to_sym]
      if id_already_stored.nil? 
         processed_data[:inter_element_link_by_id][iel_link.element1_id.to_s.to_sym] = {iel_link.element2_id.to_s.to_sym => iel_link.created_at}
      else 
        ## now the check it's hash to see if it has the corresponding iel_link.id
        logger.debug ">> id_already_stored[iel_link.element2_id.to_s.to_sym].nil?  = #{id_already_stored[iel_link.element2_id.to_s.to_sym].nil? } #in prepare_json_data of ElementsHelper"  
        if id_already_stored[iel_link.element2_id.to_s.to_sym].nil?
          id_already_stored[iel_link.element2_id.to_s.to_sym] = iel_link.created_at
        end
      end
      
      ## repeat for element2_id
      id_already_stored = processed_data[:inter_element_link_by_id][iel_link.element2_id.to_s.to_sym]  
      if id_already_stored.nil?
         processed_data[:inter_element_link_by_id][iel_link.element2_id.to_s.to_sym] = {iel_link.element1_id.to_s.to_sym => iel_link.created_at}
      else
        logger.debug ">> id_already_stored[iel_link.element1_id.to_s.to_sym].nil?  = #{id_already_stored[iel_link.element1_id.to_s.to_sym].nil? } #in prepare_json_data of ElementsHelper"
        ## now the check it's hash to see if it has the corresponding iel_link.id
        if id_already_stored[iel_link.element1_id.to_s.to_sym].nil?
          id_already_stored[iel_link.element1_id.to_s.to_sym] = iel_link.created_at
        end
      end
      
      processed_data[:inter_element_link_by_id]["size?"] = inter_element_links.length
=end
    }

    return processed_data
  end
  
  
end
