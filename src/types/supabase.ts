export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      character_images: {
        Row: {
          character_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          version: number
        }
        Insert: {
          character_id: string
          created_at?: string
          description?: string | null
          id: string
          image_url: string
          version: number
        }
        Update: {
          character_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "character_images_characterId_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_inventory: {
        Row: {
          character_id: string
          created_at: string
          equipped_slot: string | null
          id: string
          is_equipped: boolean
          is_primary: boolean | null
          item_id: string
          quantity: number
          slot_index: number | null
          updated_at: string
        }
        Insert: {
          character_id: string
          created_at?: string
          equipped_slot?: string | null
          id: string
          is_equipped?: boolean
          is_primary?: boolean | null
          item_id: string
          quantity?: number
          slot_index?: number | null
          updated_at: string
        }
        Update: {
          character_id?: string
          created_at?: string
          equipped_slot?: string | null
          id?: string
          is_equipped?: boolean
          is_primary?: boolean | null
          item_id?: string
          quantity?: number
          slot_index?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_inventory_characterId_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_inventory_itemId_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "character_equipped_items"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "character_inventory_itemId_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          base_gender: string | null
          base_layer_file: string | null
          birth_image_url: string | null
          character_type: Database["public"]["Enums"]["CharacterType"]
          coins: number
          created_at: string
          current_image_url: string | null
          current_location_id: string
          current_version: number
          energy: number
          experience: number | null
          gender: Database["public"]["Enums"]["Gender"]
          health: number
          id: string
          level: number
          name: string
          nft_address: string | null
          payment_signature: string | null
          status: string | null
          token_id: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          base_gender?: string | null
          base_layer_file?: string | null
          birth_image_url?: string | null
          character_type?: Database["public"]["Enums"]["CharacterType"]
          coins?: number
          created_at?: string
          current_image_url?: string | null
          current_location_id: string
          current_version?: number
          energy?: number
          experience?: number | null
          gender: Database["public"]["Enums"]["Gender"]
          health?: number
          id: string
          level?: number
          name: string
          nft_address?: string | null
          payment_signature?: string | null
          status?: string | null
          token_id?: string | null
          updated_at: string
          wallet_address: string
        }
        Update: {
          base_gender?: string | null
          base_layer_file?: string | null
          birth_image_url?: string | null
          character_type?: Database["public"]["Enums"]["CharacterType"]
          coins?: number
          created_at?: string
          current_image_url?: string | null
          current_location_id?: string
          current_version?: number
          energy?: number
          experience?: number | null
          gender?: Database["public"]["Enums"]["Gender"]
          health?: number
          id?: string
          level?: number
          name?: string
          nft_address?: string | null
          payment_signature?: string | null
          status?: string | null
          token_id?: string | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_currentLocationId_fkey"
            columns: ["current_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          character_id: string
          created_at: string
          id: string
          is_system: boolean
          location_id: string
          message: string
          message_type: Database["public"]["Enums"]["ChatMessageType"]
        }
        Insert: {
          character_id: string
          created_at?: string
          id: string
          is_system?: boolean
          location_id: string
          message: string
          message_type?: Database["public"]["Enums"]["ChatMessageType"]
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          is_system?: boolean
          location_id?: string
          message?: string
          message_type?: Database["public"]["Enums"]["ChatMessageType"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_characterId_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_locationId_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_slots: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          layer_type: string | null
          max_slots_base: number | null
          max_slots_per_level: number | null
          max_slots_total: number | null
          name: string
          sort_order: number | null
          unlock_level: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id: string
          is_active?: boolean | null
          layer_type?: string | null
          max_slots_base?: number | null
          max_slots_per_level?: number | null
          max_slots_total?: number | null
          name: string
          sort_order?: number | null
          unlock_level?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          layer_type?: string | null
          max_slots_base?: number | null
          max_slots_per_level?: number | null
          max_slots_total?: number | null
          name?: string
          sort_order?: number | null
          unlock_level?: number | null
        }
        Relationships: []
      }
      experience_logs: {
        Row: {
          character_id: string | null
          created_at: string | null
          details: Json | null
          experience_gained: number
          experience_total: number
          id: string
          level_after: number | null
          level_before: number | null
          leveled_up: boolean | null
          source: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string | null
          details?: Json | null
          experience_gained: number
          experience_total: number
          id?: string
          level_after?: number | null
          level_before?: number | null
          leveled_up?: boolean | null
          source: string
        }
        Update: {
          character_id?: string | null
          created_at?: string | null
          details?: Json | null
          experience_gained?: number
          experience_total?: number
          id?: string
          level_after?: number | null
          level_before?: number | null
          leveled_up?: boolean | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_logs_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          base_layer_file: string | null
          category: Database["public"]["Enums"]["ItemCategory"]
          compatibility_rules: Json | null
          created_at: string
          description: string
          durability: number | null
          energy_effect: number | null
          has_gender_variants: boolean | null
          health_effect: number | null
          id: string
          image_url: string | null
          is_visual: boolean | null
          layer_file: string | null
          layer_gender: string | null
          layer_order: number | null
          layer_type: Database["public"]["Enums"]["LayerType"] | null
          name: string
          rarity: Database["public"]["Enums"]["Rarity"]
          updated_at: string
        }
        Insert: {
          base_layer_file?: string | null
          category: Database["public"]["Enums"]["ItemCategory"]
          compatibility_rules?: Json | null
          created_at?: string
          description: string
          durability?: number | null
          energy_effect?: number | null
          has_gender_variants?: boolean | null
          health_effect?: number | null
          id: string
          image_url?: string | null
          is_visual?: boolean | null
          layer_file?: string | null
          layer_gender?: string | null
          layer_order?: number | null
          layer_type?: Database["public"]["Enums"]["LayerType"] | null
          name: string
          rarity?: Database["public"]["Enums"]["Rarity"]
          updated_at: string
        }
        Update: {
          base_layer_file?: string | null
          category?: Database["public"]["Enums"]["ItemCategory"]
          compatibility_rules?: Json | null
          created_at?: string
          description?: string
          durability?: number | null
          energy_effect?: number | null
          has_gender_variants?: boolean | null
          health_effect?: number | null
          id?: string
          image_url?: string | null
          is_visual?: boolean | null
          layer_file?: string | null
          layer_gender?: string | null
          layer_order?: number | null
          layer_type?: Database["public"]["Enums"]["LayerType"] | null
          name?: string
          rarity?: Database["public"]["Enums"]["Rarity"]
          updated_at?: string
        }
        Relationships: []
      }
      location_resources: {
        Row: {
          difficulty: number
          id: string
          item_id: string
          location_id: string
          max_per_day: number | null
          spawn_rate: number
        }
        Insert: {
          difficulty?: number
          id: string
          item_id: string
          location_id: string
          max_per_day?: number | null
          spawn_rate?: number
        }
        Update: {
          difficulty?: number
          id?: string
          item_id?: string
          location_id?: string
          max_per_day?: number | null
          spawn_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "location_resources_itemId_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "character_equipped_items"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "location_resources_itemId_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_resources_locationId_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          biome: string | null
          chat_scope: Database["public"]["Enums"]["ChatScope"]
          created_at: string
          description: string
          difficulty: number
          entry_cost: number | null
          has_chat: boolean
          has_market: boolean
          has_mining: boolean
          has_travel: boolean
          id: string
          image_url: string | null
          is_explored: boolean | null
          is_private: boolean
          last_active: string | null
          location_type: Database["public"]["Enums"]["LocationType"]
          lore: string | null
          map_x: number | null
          map_y: number | null
          min_level: number | null
          name: string
          parent_location_id: string | null
          player_count: number
          status: string | null
          svg_path_id: string | null
          territory: string | null
          theme: string | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          biome?: string | null
          chat_scope?: Database["public"]["Enums"]["ChatScope"]
          created_at?: string
          description: string
          difficulty?: number
          entry_cost?: number | null
          has_chat?: boolean
          has_market?: boolean
          has_mining?: boolean
          has_travel?: boolean
          id: string
          image_url?: string | null
          is_explored?: boolean | null
          is_private?: boolean
          last_active?: string | null
          location_type?: Database["public"]["Enums"]["LocationType"]
          lore?: string | null
          map_x?: number | null
          map_y?: number | null
          min_level?: number | null
          name: string
          parent_location_id?: string | null
          player_count?: number
          status?: string | null
          svg_path_id?: string | null
          territory?: string | null
          theme?: string | null
          updated_at: string
          welcome_message?: string | null
        }
        Update: {
          biome?: string | null
          chat_scope?: Database["public"]["Enums"]["ChatScope"]
          created_at?: string
          description?: string
          difficulty?: number
          entry_cost?: number | null
          has_chat?: boolean
          has_market?: boolean
          has_mining?: boolean
          has_travel?: boolean
          id?: string
          image_url?: string | null
          is_explored?: boolean | null
          is_private?: boolean
          last_active?: string | null
          location_type?: Database["public"]["Enums"]["LocationType"]
          lore?: string | null
          map_x?: number | null
          map_y?: number | null
          min_level?: number | null
          name?: string
          parent_location_id?: string | null
          player_count?: number
          status?: string | null
          svg_path_id?: string | null
          territory?: string | null
          theme?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_parentLocationId_fkey"
            columns: ["parent_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      market_listings: {
        Row: {
          created_at: string
          id: string
          is_system_item: boolean
          item_id: string
          location_id: string
          price: number
          quantity: number
          seller_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_system_item?: boolean
          item_id: string
          location_id: string
          price: number
          quantity?: number
          seller_id?: string | null
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system_item?: boolean
          item_id?: string
          location_id?: string
          price?: number
          quantity?: number
          seller_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_listings_itemId_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "character_equipped_items"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "market_listings_itemId_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_listings_locationId_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_listings_sellerId_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      npc_wallets: {
        Row: {
          character_id: string
          created_at: string | null
          encrypted_private_key: string
          public_key: string
        }
        Insert: {
          character_id: string
          created_at?: string | null
          encrypted_private_key: string
          public_key: string
        }
        Update: {
          character_id?: string
          created_at?: string | null
          encrypted_private_key?: string
          public_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "npc_wallets_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: true
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_payments: {
        Row: {
          amount: number
          amount_received: number | null
          character_data: Json | null
          character_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          memo: string | null
          minted_at: string | null
          nft_address: string | null
          nft_minted: boolean | null
          status: string
          transaction_signature: string | null
          treasury_wallet: string
          verified_at: string | null
          wallet_address: string
        }
        Insert: {
          amount: number
          amount_received?: number | null
          character_data?: Json | null
          character_id?: string | null
          created_at?: string | null
          expires_at: string
          id: string
          memo?: string | null
          minted_at?: string | null
          nft_address?: string | null
          nft_minted?: boolean | null
          status?: string
          transaction_signature?: string | null
          treasury_wallet: string
          verified_at?: string | null
          wallet_address: string
        }
        Update: {
          amount?: number
          amount_received?: number | null
          character_data?: Json | null
          character_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          memo?: string | null
          minted_at?: string | null
          nft_address?: string | null
          nft_minted?: boolean | null
          status?: string
          transaction_signature?: string | null
          treasury_wallet?: string
          verified_at?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_payments_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          amount_sol: number
          created_at: string
          id: string
          status: string
          transaction_signature: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          amount_sol: number
          created_at?: string
          id?: string
          status: string
          transaction_signature: string
          updated_at?: string
          wallet_address: string
        }
        Update: {
          amount_sol?: number
          created_at?: string
          id?: string
          status?: string
          transaction_signature?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          character_id: string
          created_at: string
          description: string
          energy_burn: number | null
          exchange_flux: number | null
          from_units: number | null
          from_vault: string | null
          id: string
          item_id: string | null
          quantity: number | null
          receiver_shard: string | null
          sender_shard: string | null
          sequence_id: number | null
          to_units: number | null
          to_vault: string | null
          txn_shard: string | null
          type: Database["public"]["Enums"]["TransactionType"]
          wasteland_block: number | null
        }
        Insert: {
          character_id: string
          created_at?: string
          description: string
          energy_burn?: number | null
          exchange_flux?: number | null
          from_units?: number | null
          from_vault?: string | null
          id: string
          item_id?: string | null
          quantity?: number | null
          receiver_shard?: string | null
          sender_shard?: string | null
          sequence_id?: number | null
          to_units?: number | null
          to_vault?: string | null
          txn_shard?: string | null
          type: Database["public"]["Enums"]["TransactionType"]
          wasteland_block?: number | null
        }
        Update: {
          character_id?: string
          created_at?: string
          description?: string
          energy_burn?: number | null
          exchange_flux?: number | null
          from_units?: number | null
          from_vault?: string | null
          id?: string
          item_id?: string | null
          quantity?: number | null
          receiver_shard?: string | null
          sender_shard?: string | null
          sequence_id?: number | null
          to_units?: number | null
          to_vault?: string | null
          txn_shard?: string | null
          type?: Database["public"]["Enums"]["TransactionType"]
          wasteland_block?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_characterId_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      character_equipped_items: {
        Row: {
          category: Database["public"]["Enums"]["ItemCategory"] | null
          character_id: string | null
          equipped_slot: string | null
          inventory_id: string | null
          is_equipped: boolean | null
          is_primary: boolean | null
          item_id: string | null
          item_name: string | null
          layer_file: string | null
          layer_gender: string | null
          layer_order: number | null
          layer_type: Database["public"]["Enums"]["LayerType"] | null
          rarity: Database["public"]["Enums"]["Rarity"] | null
          slot_index: number | null
          slot_name: string | null
          slot_sort_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: "character_inventory_characterId_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_stats: {
        Row: {
          avg_reservation_amount: number | null
          confirmed_reservations: number | null
          failed_reservations: number | null
          first_reservation_date: string | null
          latest_reservation_date: string | null
          pending_reservations: number | null
          total_confirmed_sol: number | null
          total_reservations: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      expire_old_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_character_visual_data: {
        Args: { character_id_param: string }
        Returns: Json
      }
      get_user_reservation_status: {
        Args: { wallet_addr: string }
        Returns: {
          has_reservation: boolean
          reservation_count: number
          total_amount: number
          latest_transaction: string
          latest_status: string
        }[]
      }
    }
    Enums: {
      CharacterType: "HUMAN" | "CREATURE" | "NPC"
      ChatMessageType: "CHAT" | "EMOTE" | "SYSTEM" | "WHISPER"
      ChatScope: "LOCAL" | "REGIONAL" | "GLOBAL"
      Gender: "MALE" | "FEMALE"
      ItemCategory:
        | "CLOTHING"
        | "HAT"
        | "ACCESSORY"
        | "TOOL"
        | "CONSUMABLE"
        | "MATERIAL"
      LayerType:
        | "BACKGROUND"
        | "BASE"
        | "CLOTHING"
        | "HAT"
        | "FACE_COVERING"
        | "ACCESSORY"
        | "OUTERWEAR"
        | "FACE_ACCESSORY"
      LocationType:
        | "REGION"
        | "CITY"
        | "BUILDING"
        | "ROOM"
        | "REALM"
        | "CONTINENT"
        | "COUNTRY"
        | "PROVINCE"
        | "ISLAND"
        | "ARCHIPELAGO"
        | "DISTRICT"
        | "NEIGHBORHOOD"
        | "CAMPUS"
        | "COMPLEX"
        | "WING"
        | "FLOOR"
        | "SUITE"
        | "ZONE"
        | "CUBICLE"
        | "WORKSTATION"
        | "SEAT"
        | "PLOT"
        | "LOT"
        | "FACILITY"
        | "VENUE"
        | "CAVE_ENTRANCE"
        | "TUNNEL_JUNCTION"
        | "CHAMBER"
        | "ALCOVE"
        | "CREVICE"
        | "SHAFT"
        | "PIT"
        | "CHASM"
        | "GORGE"
        | "RAVINE"
        | "VALLEY"
        | "PEAK"
        | "SUMMIT"
        | "RIDGE"
        | "SLOPE"
        | "PLATEAU"
        | "PLAIN"
        | "BASIN"
        | "CRATER"
        | "CALDERA"
      Rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY"
      TransactionType:
        | "MINT"
        | "MINE"
        | "BUY"
        | "SELL"
        | "TRAVEL"
        | "EQUIP"
        | "UNEQUIP"
        | "EXCHANGE"
        | "BRIDGE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      CharacterType: ["HUMAN", "CREATURE", "NPC"],
      ChatMessageType: ["CHAT", "EMOTE", "SYSTEM", "WHISPER"],
      ChatScope: ["LOCAL", "REGIONAL", "GLOBAL"],
      Gender: ["MALE", "FEMALE"],
      ItemCategory: [
        "CLOTHING",
        "HAT",
        "ACCESSORY",
        "TOOL",
        "CONSUMABLE",
        "MATERIAL",
      ],
      LayerType: [
        "BACKGROUND",
        "BASE",
        "CLOTHING",
        "HAT",
        "FACE_COVERING",
        "ACCESSORY",
        "OUTERWEAR",
        "FACE_ACCESSORY",
      ],
      LocationType: [
        "REGION",
        "CITY",
        "BUILDING",
        "ROOM",
        "REALM",
        "CONTINENT",
        "COUNTRY",
        "PROVINCE",
        "ISLAND",
        "ARCHIPELAGO",
        "DISTRICT",
        "NEIGHBORHOOD",
        "CAMPUS",
        "COMPLEX",
        "WING",
        "FLOOR",
        "SUITE",
        "ZONE",
        "CUBICLE",
        "WORKSTATION",
        "SEAT",
        "PLOT",
        "LOT",
        "FACILITY",
        "VENUE",
        "CAVE_ENTRANCE",
        "TUNNEL_JUNCTION",
        "CHAMBER",
        "ALCOVE",
        "CREVICE",
        "SHAFT",
        "PIT",
        "CHASM",
        "GORGE",
        "RAVINE",
        "VALLEY",
        "PEAK",
        "SUMMIT",
        "RIDGE",
        "SLOPE",
        "PLATEAU",
        "PLAIN",
        "BASIN",
        "CRATER",
        "CALDERA",
      ],
      Rarity: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
      TransactionType: [
        "MINT",
        "MINE",
        "BUY",
        "SELL",
        "TRAVEL",
        "EQUIP",
        "UNEQUIP",
        "EXCHANGE",
        "BRIDGE",
      ],
    },
  },
} as const
