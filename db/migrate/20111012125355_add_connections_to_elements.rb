class AddConnectionsToElements < ActiveRecord::Migration
  def self.up
    add_column :elements, :connects_from, :integer
    add_column :elements, :connects_to, :integer
    
    add_index :elements, :connects_from
    add_index :elements, :connects_to
    
    puts ">>>  #in self.up of AddConnectionsToElements"
    
    counter = 0
    error_counter = 0
    ##loop through each connection element, get it's content, and parse it into connects_to and connects_from columns
    say_with_time "Updating connects_to and connects_from for connection elements..." do
      Element.connections.each {|connection|
          puts ">>>  #in self.up of AddConnectionsToElements"
          
          connect_ids = connection.content.split(',')
          connection.connects_from = connect_ids[0]
          connection.connects_to = connect_ids[1]
          if (connection.save)
            puts ">>> connection.save = true for connection.id = #{connection.id}  #in self.up of AddConnectionsToElements"
          else 
            puts ">>> ERROR connection.save = false for connection.id = #{connection.id}  #in self.up of AddConnectionsToElements"
            error_counter += 1
          end
          counter += 1
        }
      puts ">>> processed #{counter} connection elements, with #{error_counter} errors  #in self.up of AddConnectionsToElements"
    end
    
    counter = 0
    error_counter = 0
    element_part_ids_with_no_parent_node = []
    ##loop through each part element, get it's iels and parse it into connects_to
    say_with_time "Updating connects_to for part elements..." do
      puts ">>>  Element.part_elements = #{Element.part_elements.all}  #in self.up of AddConnectionsToElements"
      
      Element.part_elements.each {|part_element|
          the_node_this_part_references = Element.other_elements(part_element.id).nodes
          
          if (the_node_this_part_references.all.length == 1)
            puts ">>>  the_node_this_part_references = #{the_node_this_part_references.first.id}  #in self.up of AddConnectionsToElements"
            part_element.connects_to = the_node_this_part_references.first.id
              
            if (part_element.save)
              puts ">>> part_element.save = true for part_element.id = #{part_element.id}  #in self.up of AddConnectionsToElements"
            else 
              puts ">>> ERROR part_element.save = false for part_element.id = #{part_element.id}  #in self.up of AddConnectionsToElements"
              error_counter += 1
            end
            counter += 1
          else
            ## this part elements has 0 or 2 or more parent nodes, rather than 1 parent node
            element_part_ids_with_no_parent_node.push(part_element.id)
            error_counter += 1
          end
        }
        
      error_sub_string = ''
      unless element_part_ids_with_no_parent_node.empty?
        error_sub_string = "\n~~~~!!!!!!~~~~ERROR~~~~!!!!!!~~~~\n These part elements had no or more than 1 parent node: #{element_part_ids_with_no_parent_node} \n~~~~!!!!!!~~~~ERROR~~~~!!!!!!~~~~"
      end
      puts ">>> processed #{counter} part elements, with #{error_counter} errors #{error_sub_string}  #in self.up of AddConnectionsToElements"
    end
  end
  
  
  def self.down
    remove_index :elements, :connects_to
    remove_index :elements, :connects_from
    
    remove_column :elements, :connects_to
    remove_column :elements, :connects_from
  end
end
