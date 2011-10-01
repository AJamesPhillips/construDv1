=begin   # from http://errtheblog.com/posts/14-composite-migrations
ActiveRecord::ConnectionAdapters::ColumnDefinition.class_eval <<-'EOF'
  def to_sql
    if name.is_a? Array
      column_sql = "PRIMARY KEY (#{name.join(',')})" 
    else
      column_sql = "#{base.quote_column_name(name)} #{type_to_sql(type.to_sym, limit)}" 
      add_column_options!(column_sql, :null => null, :default => default)
    end
    column_sql
  end
EOF

ActiveRecord::ConnectionAdapters::ColumnDefinition.send(:alias_method, :to_s, :to_sql)
=end

class CreateInterElementLinks < ActiveRecord::Migration
  def self.up
    create_table :inter_element_links, :id => false do |t|
      t.integer :element1_id, :null => false
      t.integer :element2_id, :null => false

      t.timestamps
    end
    add_index :inter_element_links, [:element1_id, :element2_id], :unique => true
  end

  def self.down
    remove_index :inter_element_links, [:element1_id, :element2_id]
    drop_table :inter_element_links
  end
end
