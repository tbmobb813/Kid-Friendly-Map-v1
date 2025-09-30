import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import Colors from "@/constants/colors";
import SearchBar from "./SearchBar";
import { MapPin, Clock, Star } from "lucide-react-native";
import { useDebounce } from "@/hooks/useDebounce";
import { Place } from "@/types/navigation";

type SearchSuggestion = {
  id: string;
  text: string;
  type: "recent" | "popular" | "place";
  place?: Place;
};

type SearchWithSuggestionsProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
};

const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder,
  suggestions = [],
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    setShowSuggestions(debouncedValue.length > 0 && suggestions.length > 0);
  }, [debouncedValue, suggestions]);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "recent": return <Clock size={16} color={Colors.textLight} />;
      case "popular": return <Star size={16} color={Colors.warning} />;
      case "place": return <MapPin size={16} color={Colors.primary} />;
      default: return <MapPin size={16} color={Colors.textLight} />;
    }
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <Pressable
      style={styles.suggestionItem}
      onPress={() => {
        onSelectSuggestion(item);
        setShowSuggestions(false);
      }}
    >
      {getSuggestionIcon(item.type)}
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item.text}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <SearchBar
        value={value}
        onChangeText={onChangeText}
        onClear={() => {
          onChangeText("");
          setShowSuggestions(false);
        }}
        placeholder={placeholder}
      />
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions.slice(0, 5)} // Limit to 5 suggestions
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  suggestionsContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
});

export default SearchWithSuggestions;
