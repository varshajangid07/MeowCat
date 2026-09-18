#include <emscripten/emscripten.h>
#include <string>
#include <algorithm>
#include <cctype>
#include <vector>
#include <regex>
extern "C" {
    EMSCRIPTEN_KEEPALIVE
    bool is_valid_email(const char* email_str) {
        std::string email(email_str);
        const std::regex pattern(R"(^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)");
        return std::regex_match(email, pattern);
    }

    EMSCRIPTEN_KEEPALIVE
    bool is_valid_feedback(const char* feedback_str) {
        std::string feedback(feedback_str);
        bool all_spaces = std::all_of(feedback.begin(), feedback.end(), [](unsigned char c) { 
            return std::isspace(c); 
        });        
        if (feedback.empty() || all_spaces) {
            return false;
        }
        std::string lower_feedback = feedback;
        std::transform(lower_feedback.begin(), lower_feedback.end(), lower_feedback.begin(), [](unsigned char c){ return std::tolower(c); });
        std::vector<std::string> blocked_words = {
            "http://", "https://", "www.", ".com", 
            "spam", "buy now", "click here", "crypto"
        };
        for (const auto& word : blocked_words) {
            if (lower_feedback.find(word) != std::string::npos) {
                return false; 
            }
        }
        return true;
    }
}