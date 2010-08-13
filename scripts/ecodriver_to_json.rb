#!/usr/bin/env ruby
require 'rubygems'
require 'open-uri'
require 'csv'
require 'json'
require 'date'

class NilClass
  def strip
    nil
  end
end

date = Date.new(2010,7,8)
end_date = Date.new(2010,8,3)

department = ARGV[0]
department_lc = department.downcase

def coallesce(list)
  first = list.first
  hash = Hash.new(0)
  hash["Site Name"] = first["Site Name"]
  hash["Date"] = first["Date"]
  hash["Type"] = first["Type"]
  hash["Utility"] = first["Utility"]
  list.each do |h|
    h.keys.each do |k|
      if k =~ /\d+/
        value = h[k].to_f
        hash[k] += value
      end
    end
  end
  hash
end

def parse(f)
  headings = ["Site Name","Date","Type","00:30","01:00","01:30","02:00","02:30","03:00","03:30","04:00","04:30","05:00",
                                        "05:30","06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
                                        "11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00",
                                        "16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30",
                                        "22:00","22:30","23:00","23:30","00:00"]
                                        
  readings = []
  f.gets # skip first line
  
  type_read = false
  while(line = f.gets)
    unless type_read
      type = line.strip
      type_read = true
    else
      if type =~ /Electricity/
        fields = CSV.parse_line(line).map{|m| m.strip }
        hash = Hash[*headings.zip(fields).flatten]
        hash["Utility"] = "Electricity"
        readings << hash
      end
      type_read = false
    end
  end
  coallesce(readings)
end

days = []
while (date != end_date)
  url_template = "http://www.ecodriver.uk.com/eCMS/Files/%s/%s/%02d/%s_hhoutput_%02d-%02d-%d.csv" 
  url = url_template % [department,date.year, date.month, department_lc, date.day, date.month, date.year]
  open(url) do |f|
    days << parse(f)
  end
  date = date.succ
end
puts days.to_json

# days = []
# open("http://www.stark.co.uk/government/DWP/Reports/DYTS01_kWh.csv") do |f|
#   found_headings = false
#   while (line=f.gets)
#     fields = CSV.parse_line(line).map{|m| m.strip }
#     next if fields.size < 10
#     unless found_headings
#       headings = fields
#       found_headings = true
#     else
#       days << Hash[*headings.zip(fields).flatten]
#     end
#   end  
# end
# puts days.to_json
