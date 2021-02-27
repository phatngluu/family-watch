#include <stdio.h>
#include <stdlib.h>
#include<iostream>
#include <unordered_map>
#include <string>
#include <algorithm>


// for simple key value pairs
class CustomMessage {
	private:
		std::unordered_map<std::string, std::string> umap;
		static const char SPECIAL_CHAR = ';'; // special character to split message
	public:
		void put(std::string key, std::string value) {
			// put only if special character isn't found in the key and value
			 if (key.find(SPECIAL_CHAR) == std::string::npos 
			 	&& value.find(SPECIAL_CHAR) == std::string::npos) {
			 	umap[key] = value;
			 	
			 } else {
			 	// error handling here
			 }
		}
		
		void put(std::string keyValuePairs) {
			char special = SPECIAL_CHAR;
			size_t count = std::count(keyValuePairs.begin(), keyValuePairs.end(), special);
			if (count % 2 == 0) {
				int n = 0, firstKeyChar = 0, lastKeyChar = 0;
				for (int i = 0; i < keyValuePairs.size(); i++) {
					if (keyValuePairs[i] == special) {
						n++;
						
						if (n == 1) {
							lastKeyChar = i;
						} else if (n == 2) {
							// substring uses (pos, length), not (pos1, pos2)
							std::string 
								key = keyValuePairs.substr(firstKeyChar, lastKeyChar - firstKeyChar),
								value = keyValuePairs.substr(lastKeyChar + 1, i - lastKeyChar - 1);
							put(key, value);
							
							n = 0;
							firstKeyChar = i + 1;
						}
					}
				}
			} else {
				// error handling here
			}
		}
		
		std::string getValue(std::string key) {
			if (umap.find(key) == umap.end()) {
				return "";
			} else {
				return umap[key];
			}
		}
		
		std::string getMessage(void) {
			if (umap.empty()) {
				// error handling here
				return "";
			} else {
				std::string result = "";
				for (auto x : umap) {
					result += x.first;
					result += SPECIAL_CHAR;
					result += x.second;
					result += SPECIAL_CHAR;
				}
				
				return result;
			}
		}
};

int main()
{
	// usage
	CustomMessage message1, message2;
	// avoid using raw strings over and over for easier key rename
	std::string key1 = "test1", key2 = "test2", key3 = "whatever";
	message1.put(key1, "value1");
	message1.put(key2, "value2");
	message1.put(key3, "value3");
	
	std::cout << message1.getMessage() << std::endl;
	
	std::cout << message1.getValue("asd") << std::endl;
	std::cout << message1.getValue(key1) << std::endl;
	
	message2.put(message1.getMessage());
	std::cout << message2.getMessage() << std::endl;
	std::cout << message2.getValue(key1) << std::endl;
	std::cout << message2.getValue(key2) << std::endl;
	std::cout << message2.getValue(key3) << std::endl;
	return 0;
}
