export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          entity: string | null
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      admin_notification_settings: {
        Row: {
          admin_user_id: string
          enable_sms: boolean | null
          enable_telegram: boolean | null
          enable_whatsapp: boolean | null
          id: string
          shop_hero_subtitle: string | null
          shop_hero_title: string | null
          sms_number: string | null
          telegram_chat_id: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          admin_user_id: string
          enable_sms?: boolean | null
          enable_telegram?: boolean | null
          enable_whatsapp?: boolean | null
          id?: string
          shop_hero_subtitle?: string | null
          shop_hero_title?: string | null
          sms_number?: string | null
          telegram_chat_id?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          admin_user_id?: string
          enable_sms?: boolean | null
          enable_telegram?: boolean | null
          enable_whatsapp?: boolean | null
          id?: string
          shop_hero_subtitle?: string | null
          shop_hero_title?: string | null
          sms_number?: string | null
          telegram_chat_id?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          content_bn: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          excerpt_bn: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string | null
          source_url: string | null
          tags: Json
          title: string
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          content_bn?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_bn?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string | null
          source_url?: string | null
          tags?: Json
          title: string
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          content_bn?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_bn?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string | null
          source_url?: string | null
          tags?: Json
          title?: string
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          category: string
          created_at: string
          id: string
          monthly_limit: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          monthly_limit: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          monthly_limit?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          display_name: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applies_to: string
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order: number
          starts_at: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          applies_to?: string
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order?: number
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order?: number
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string
          debt_id: string
          id: string
          note: string | null
          paid_at: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          debt_id: string
          id?: string
          note?: string | null
          paid_at?: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          debt_id?: string
          id?: string
          note?: string | null
          paid_at?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "finance_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          amount: number
          counterparty: string
          created_at: string
          direction: string
          due_date: string | null
          id: string
          is_settled: boolean
          note: string | null
          paid_amount: number
          updated_at: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          counterparty: string
          created_at?: string
          direction: string
          due_date?: string | null
          id?: string
          is_settled?: boolean
          note?: string | null
          paid_amount?: number
          updated_at?: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          counterparty?: string
          created_at?: string
          direction?: string
          due_date?: string | null
          id?: string
          is_settled?: boolean
          note?: string | null
          paid_amount?: number
          updated_at?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debts_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "finance_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_recurring_bills: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          due_day: number
          id: string
          is_active: boolean
          last_paid_at: string | null
          name: string
          note: string | null
          scope: string
          sort_order: number
          updated_at: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          due_day?: number
          id?: string
          is_active?: boolean
          last_paid_at?: string | null
          name: string
          note?: string | null
          scope?: string
          sort_order?: number
          updated_at?: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          due_day?: number
          id?: string
          is_active?: boolean
          last_paid_at?: string | null
          name?: string
          note?: string | null
          scope?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_recurring_bills_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "finance_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_sales: {
        Row: {
          cost_price: number
          courier_charge: number
          courier_name: string | null
          created_at: string
          customer_address: string | null
          customer_name: string
          customer_phone: string | null
          delivered_at: string | null
          delivery_status: string
          discount: number
          id: string
          notes: string | null
          occurred_at: string
          order_no: string | null
          paid_amount: number
          payment_method: string | null
          payment_status: string
          product_id: string | null
          product_name: string
          quantity: number
          return_reason: string | null
          total_amount: number
          tracking_id: string | null
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_price?: number
          courier_charge?: number
          courier_name?: string | null
          created_at?: string
          customer_address?: string | null
          customer_name: string
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_status?: string
          discount?: number
          id?: string
          notes?: string | null
          occurred_at?: string
          order_no?: string | null
          paid_amount?: number
          payment_method?: string | null
          payment_status?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          return_reason?: string | null
          total_amount?: number
          tracking_id?: string | null
          unit_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_price?: number
          courier_charge?: number
          courier_name?: string | null
          created_at?: string
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_status?: string
          discount?: number
          id?: string
          notes?: string | null
          occurred_at?: string
          order_no?: string | null
          paid_amount?: number
          payment_method?: string | null
          payment_status?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          return_reason?: string | null
          total_amount?: number
          tracking_id?: string | null
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          id: string
          meta: Json
          note: string | null
          occurred_at: string
          party: string | null
          product_id: string | null
          scope: string
          subcategory: string | null
          transfer_to_wallet_id: string | null
          type: string
          updated_at: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          id?: string
          meta?: Json
          note?: string | null
          occurred_at?: string
          party?: string | null
          product_id?: string | null
          scope?: string
          subcategory?: string | null
          transfer_to_wallet_id?: string | null
          type: string
          updated_at?: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          id?: string
          meta?: Json
          note?: string | null
          occurred_at?: string
          party?: string | null
          product_id?: string | null
          scope?: string
          subcategory?: string | null
          transfer_to_wallet_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_transfer_to_wallet_id_fkey"
            columns: ["transfer_to_wallet_id"]
            isOneToOne: false
            referencedRelation: "finance_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "finance_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_wallets: {
        Row: {
          archived: boolean
          balance: number
          color: string | null
          created_at: string
          currency: string
          icon: string | null
          id: string
          is_default: boolean
          name: string
          provider: string | null
          scope: string
          sort_order: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          balance?: number
          color?: string | null
          created_at?: string
          currency?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          name: string
          provider?: string | null
          scope?: string
          sort_order?: number
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          balance?: number
          color?: string | null
          created_at?: string
          currency?: string
          icon?: string | null
          id?: string
          is_default?: boolean
          name?: string
          provider?: string | null
          scope?: string
          sort_order?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_withdrawals: {
        Row: {
          amount: number
          created_at: string
          fee: number
          id: string
          method: string | null
          note: string | null
          occurred_at: string
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          fee?: number
          id?: string
          method?: string | null
          note?: string | null
          occurred_at?: string
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          fee?: number
          id?: string
          method?: string | null
          note?: string | null
          occurred_at?: string
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_withdrawals_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "finance_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_blocks: {
        Row: {
          block_type: string
          config: Json
          created_at: string
          id: string
          image: string | null
          is_active: boolean
          link: string | null
          sort_order: number
          subtitle: string | null
          subtitle_bn: string | null
          title: string | null
          title_bn: string | null
          updated_at: string
        }
        Insert: {
          block_type: string
          config?: Json
          created_at?: string
          id?: string
          image?: string | null
          is_active?: boolean
          link?: string | null
          sort_order?: number
          subtitle?: string | null
          subtitle_bn?: string | null
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Update: {
          block_type?: string
          config?: Json
          created_at?: string
          id?: string
          image?: string | null
          is_active?: boolean
          link?: string | null
          sort_order?: number
          subtitle?: string | null
          subtitle_bn?: string | null
          title?: string | null
          title_bn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          amount_paid: number
          courier_name: string | null
          created_at: string
          id: string
          location: string | null
          note: string | null
          occurred_at: string
          party_name: string | null
          party_phone: string | null
          product_id: string
          qty: number
          related_tx_id: string | null
          status: string
          tracking_no: string | null
          type: string
          unit_price: number
          user_id: string
        }
        Insert: {
          amount_paid?: number
          courier_name?: string | null
          created_at?: string
          id?: string
          location?: string | null
          note?: string | null
          occurred_at?: string
          party_name?: string | null
          party_phone?: string | null
          product_id: string
          qty: number
          related_tx_id?: string | null
          status?: string
          tracking_no?: string | null
          type: string
          unit_price?: number
          user_id: string
        }
        Update: {
          amount_paid?: number
          courier_name?: string | null
          created_at?: string
          id?: string
          location?: string | null
          note?: string | null
          occurred_at?: string
          party_name?: string | null
          party_phone?: string | null
          product_id?: string
          qty?: number
          related_tx_id?: string | null
          status?: string
          tracking_no?: string | null
          type?: string
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_products: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          low_stock_threshold: number
          name: string
          note: string | null
          purchase_price: number
          scope: string
          sell_price: number
          sku: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          low_stock_threshold?: number
          name: string
          note?: string | null
          purchase_price?: number
          scope?: string
          sell_price?: number
          sku?: string | null
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          low_stock_threshold?: number
          name?: string
          note?: string | null
          purchase_price?: number
          scope?: string
          sell_price?: number
          sku?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          category: string
          condition: string
          contact_name: string | null
          contact_phone: string
          created_at: string
          description: string
          id: string
          images: string[]
          location: string
          price: number
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string
          condition?: string
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          description: string
          id?: string
          images?: string[]
          location: string
          price: number
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          condition?: string
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          location?: string
          price?: number
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      owned_assets: {
        Row: {
          acquire_cost: number
          acquired_at: string | null
          actual_repair_cost: number
          buyer_name: string | null
          buyer_phone: string | null
          category: string | null
          condition: string
          created_at: string
          estimated_repair_cost: number
          expected_value: number
          id: string
          identity: string | null
          issue_description: string | null
          name: string
          note: string | null
          repair_details: string | null
          repair_needed: boolean
          repaired_at: string | null
          sold_at: string | null
          sold_price: number
          source_name: string | null
          source_phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acquire_cost?: number
          acquired_at?: string | null
          actual_repair_cost?: number
          buyer_name?: string | null
          buyer_phone?: string | null
          category?: string | null
          condition?: string
          created_at?: string
          estimated_repair_cost?: number
          expected_value?: number
          id?: string
          identity?: string | null
          issue_description?: string | null
          name: string
          note?: string | null
          repair_details?: string | null
          repair_needed?: boolean
          repaired_at?: string | null
          sold_at?: string | null
          sold_price?: number
          source_name?: string | null
          source_phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acquire_cost?: number
          acquired_at?: string | null
          actual_repair_cost?: number
          buyer_name?: string | null
          buyer_phone?: string | null
          category?: string | null
          condition?: string
          created_at?: string
          estimated_repair_cost?: number
          expected_value?: number
          id?: string
          identity?: string | null
          issue_description?: string | null
          name?: string
          note?: string | null
          repair_details?: string | null
          repair_needed?: boolean
          repaired_at?: string | null
          sold_at?: string | null
          sold_price?: number
          source_name?: string | null
          source_phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planned_purchases: {
        Row: {
          created_at: string
          est_price: number
          id: string
          is_done: boolean
          item: string
          note: string | null
          plan_date: string | null
          priority: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          est_price?: number
          id?: string
          is_done?: boolean
          item: string
          note?: string | null
          plan_date?: string | null
          priority?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          est_price?: number
          id?: string
          is_done?: boolean
          item?: string
          note?: string | null
          plan_date?: string | null
          priority?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_experience: {
        Row: {
          company: string | null
          created_at: string
          description: string | null
          description_bn: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          title_bn: string | null
          updated_at: string
          year: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          title_bn?: string | null
          updated_at?: string
          year?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          title_bn?: string | null
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          description_bn: string | null
          id: string
          image: string | null
          is_active: boolean
          link: string | null
          sort_order: number
          title: string
          title_bn: string | null
          updated_at: string
          year: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          link?: string | null
          sort_order?: number
          title: string
          title_bn?: string | null
          updated_at?: string
          year?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_bn?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          link?: string | null
          sort_order?: number
          title?: string
          title_bn?: string | null
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      product_requests: {
        Row: {
          admin_note: string | null
          budget: number | null
          created_at: string
          details: string | null
          id: string
          name: string
          phone: string | null
          product_name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          budget?: number | null
          created_at?: string
          details?: string | null
          id?: string
          name: string
          phone?: string | null
          product_name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          budget?: number | null
          created_at?: string
          details?: string | null
          id?: string
          name?: string
          phone?: string | null
          product_name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          product_id: string
          rating: number
          reviewer_name: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          product_id: string
          rating: number
          reviewer_name?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          product_id?: string
          rating?: number
          reviewer_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          currency: string
          date_of_birth: string | null
          facebook: string | null
          full_name: string | null
          gender: string | null
          id: string
          language_pref: string | null
          monthly_income: number
          notifications_enabled: boolean | null
          occupation: string | null
          phone: string | null
          theme_pref: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          date_of_birth?: string | null
          facebook?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          language_pref?: string | null
          monthly_income?: number
          notifications_enabled?: boolean | null
          occupation?: string | null
          phone?: string | null
          theme_pref?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          date_of_birth?: string | null
          facebook?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          language_pref?: string | null
          monthly_income?: number
          notifications_enabled?: boolean | null
          occupation?: string | null
          phone?: string | null
          theme_pref?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      rentals: {
        Row: {
          bathrooms: number
          bedrooms: number
          contact_name: string | null
          contact_phone: string
          created_at: string
          description: string
          id: string
          images: string[]
          location: string
          price: number
          size: number
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bathrooms?: number
          bedrooms?: number
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          description: string
          id?: string
          images?: string[]
          location: string
          price: number
          size?: number
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bathrooms?: number
          bedrooms?: number
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          location?: string
          price?: number
          size?: number
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          interest_rate: number
          is_completed: boolean
          kind: string
          monthly_contribution: number
          months_paid: number
          months_total: number | null
          note: string | null
          priority: number
          saved_amount: number
          scope: string
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          interest_rate?: number
          is_completed?: boolean
          kind?: string
          monthly_contribution?: number
          months_paid?: number
          months_total?: number | null
          note?: string | null
          priority?: number
          saved_amount?: number
          scope?: string
          target_amount: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          interest_rate?: number
          is_completed?: boolean
          kind?: string
          monthly_contribution?: number
          months_paid?: number
          months_total?: number | null
          note?: string | null
          priority?: number
          saved_amount?: number
          scope?: string
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_messages: {
        Row: {
          channel: string
          created_at: string
          error: string | null
          id: string
          message: string
          recipient_name: string
          recipient_phone: string
          send_at: string
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          message: string
          recipient_name: string
          recipient_phone: string
          send_at: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          error?: string | null
          id?: string
          message?: string
          recipient_name?: string
          recipient_phone?: string
          send_at?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sellable_assets: {
        Row: {
          condition: string
          created_at: string
          est_value: number
          id: string
          is_sold: boolean
          item: string
          note: string | null
          sold_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          condition?: string
          created_at?: string
          est_value?: number
          id?: string
          is_sold?: boolean
          item: string
          note?: string | null
          sold_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          est_value?: number
          id?: string
          is_sold?: boolean
          item?: string
          note?: string | null
          sold_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_jobs: {
        Row: {
          advance_amount: number
          charge_amount: number
          cost_amount: number
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          id: string
          item_identity: string | null
          item_name: string
          job_type: string
          note: string | null
          paid_amount: number
          payment_status: string
          promised_at: string | null
          received_at: string
          service_kind: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advance_amount?: number
          charge_amount?: number
          cost_amount?: number
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          item_identity?: string | null
          item_name: string
          job_type?: string
          note?: string | null
          paid_amount?: number
          payment_status?: string
          promised_at?: string | null
          received_at?: string
          service_kind?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advance_amount?: number
          charge_amount?: number
          cost_amount?: number
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          item_identity?: string | null
          item_name?: string
          job_type?: string
          note?: string | null
          paid_amount?: number
          payment_status?: string
          promised_at?: string | null
          received_at?: string
          service_kind?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_orders: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          notified: boolean | null
          project_details: string | null
          quoted_amount: number
          service_id: string | null
          service_name: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notified?: boolean | null
          project_details?: string | null
          quoted_amount: number
          service_id?: string | null
          service_name: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notified?: boolean | null
          project_details?: string | null
          quoted_amount?: number
          service_id?: string | null
          service_name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          budget: string | null
          created_at: string
          description: string
          email: string | null
          id: string
          name: string
          phone: string
          service_type: string
          status: string
          updated_at: string
          urgent: boolean
          user_id: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          description: string
          email?: string | null
          id?: string
          name: string
          phone: string
          service_type: string
          status?: string
          updated_at?: string
          urgent?: boolean
          user_id?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          service_type?: string
          status?: string
          updated_at?: string
          urgent?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      services_catalog: {
        Row: {
          badge: string | null
          badge_color: string | null
          category: string | null
          created_at: string
          delivery_days: number | null
          display_order: number | null
          features: Json | null
          features_bn: Json | null
          full_description: string | null
          full_description_bn: string | null
          gallery: Json | null
          id: string
          image: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          name_bn: string | null
          short_description: string | null
          short_description_bn: string | null
          starting_price: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          badge_color?: string | null
          category?: string | null
          created_at?: string
          delivery_days?: number | null
          display_order?: number | null
          features?: Json | null
          features_bn?: Json | null
          full_description?: string | null
          full_description_bn?: string | null
          gallery?: Json | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          name_bn?: string | null
          short_description?: string | null
          short_description_bn?: string | null
          starting_price?: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          badge_color?: string | null
          category?: string | null
          created_at?: string
          delivery_days?: number | null
          display_order?: number | null
          features?: Json | null
          features_bn?: Json | null
          full_description?: string | null
          full_description_bn?: string | null
          gallery?: Json | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          name_bn?: string | null
          short_description?: string | null
          short_description_bn?: string | null
          starting_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      shop_orders: {
        Row: {
          addons: Json | null
          admin_note: string | null
          coupon_code: string | null
          courier_name: string | null
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_charge: number
          delivery_payload: string | null
          id: string
          notes: string | null
          notified: boolean | null
          payment_proof: string | null
          payment_txn_id: string | null
          product_id: string | null
          product_name: string
          product_type: string
          quantity: number
          status: string
          total_amount: number
          tracking_no: string | null
          unit_price: number
          user_id: string | null
        }
        Insert: {
          addons?: Json | null
          admin_note?: string | null
          coupon_code?: string | null
          courier_name?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_charge?: number
          delivery_payload?: string | null
          id?: string
          notes?: string | null
          notified?: boolean | null
          payment_proof?: string | null
          payment_txn_id?: string | null
          product_id?: string | null
          product_name: string
          product_type?: string
          quantity?: number
          status?: string
          total_amount: number
          tracking_no?: string | null
          unit_price: number
          user_id?: string | null
        }
        Update: {
          addons?: Json | null
          admin_note?: string | null
          coupon_code?: string | null
          courier_name?: string | null
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_charge?: number
          delivery_payload?: string | null
          id?: string
          notes?: string | null
          notified?: boolean | null
          payment_proof?: string | null
          payment_txn_id?: string | null
          product_id?: string | null
          product_name?: string
          product_type?: string
          quantity?: number
          status?: string
          total_amount?: number
          tracking_no?: string | null
          unit_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          addon_ids: Json | null
          badge: string | null
          badge_color: string | null
          category: string | null
          created_at: string
          digital_delivery_info: string | null
          discount_price: number | null
          full_description: string | null
          full_description_bn: string | null
          gallery: Json | null
          id: string
          image: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          name_bn: string | null
          offer_enabled: boolean | null
          offer_started_at: string | null
          price: number
          product_type: string
          related_ids: Json | null
          short_description: string | null
          short_description_bn: string | null
          slug: string | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          addon_ids?: Json | null
          badge?: string | null
          badge_color?: string | null
          category?: string | null
          created_at?: string
          digital_delivery_info?: string | null
          discount_price?: number | null
          full_description?: string | null
          full_description_bn?: string | null
          gallery?: Json | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          name_bn?: string | null
          offer_enabled?: boolean | null
          offer_started_at?: string | null
          price?: number
          product_type?: string
          related_ids?: Json | null
          short_description?: string | null
          short_description_bn?: string | null
          slug?: string | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          addon_ids?: Json | null
          badge?: string | null
          badge_color?: string | null
          category?: string | null
          created_at?: string
          digital_delivery_info?: string | null
          discount_price?: number | null
          full_description?: string | null
          full_description_bn?: string | null
          gallery?: Json | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          name_bn?: string | null
          offer_enabled?: boolean | null
          offer_started_at?: string | null
          price?: number
          product_type?: string
          related_ids?: Json | null
          short_description?: string | null
          short_description_bn?: string | null
          slug?: string | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          category: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      train_alert_notifications: {
        Row: {
          created_at: string
          delivered_browser: boolean
          delivered_sms: boolean
          from_station: string
          id: string
          journey_date: string
          message: string
          phone: string
          seat_class: string | null
          seats_available: number
          subscriber_id: string
          to_station: string
          train_name: string
          train_number: string
        }
        Insert: {
          created_at?: string
          delivered_browser?: boolean
          delivered_sms?: boolean
          from_station: string
          id?: string
          journey_date: string
          message: string
          phone: string
          seat_class?: string | null
          seats_available?: number
          subscriber_id: string
          to_station: string
          train_name: string
          train_number: string
        }
        Update: {
          created_at?: string
          delivered_browser?: boolean
          delivered_sms?: boolean
          from_station?: string
          id?: string
          journey_date?: string
          message?: string
          phone?: string
          seat_class?: string | null
          seats_available?: number
          subscriber_id?: string
          to_station?: string
          train_name?: string
          train_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "train_alert_notifications_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "train_alert_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      train_alert_subscribers: {
        Row: {
          active: boolean
          channel: string
          created_at: string
          email: string | null
          from_station: string
          id: string
          journey_date: string
          language: string
          last_checked_at: string | null
          last_notified_at: string | null
          last_seats_found: number
          name: string | null
          phone: string
          seat_class: string | null
          to_station: string
          train_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          channel?: string
          created_at?: string
          email?: string | null
          from_station: string
          id?: string
          journey_date: string
          language?: string
          last_checked_at?: string | null
          last_notified_at?: string | null
          last_seats_found?: number
          name?: string | null
          phone: string
          seat_class?: string | null
          to_station: string
          train_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          channel?: string
          created_at?: string
          email?: string | null
          from_station?: string
          id?: string
          journey_date?: string
          language?: string
          last_checked_at?: string | null
          last_notified_at?: string | null
          last_seats_found?: number
          name?: string | null
          phone?: string
          seat_class?: string | null
          to_station?: string
          train_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          note: string | null
          occurred_on: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          id?: string
          note?: string | null
          occurred_on?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          note?: string | null
          occurred_on?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vault_items: {
        Row: {
          category: string
          created_at: string
          encrypted_data: string
          id: string
          iv: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          encrypted_data: string
          id?: string
          iv: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          encrypted_data?: string
          id?: string
          iv?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weather_alert_subscribers: {
        Row: {
          active: boolean
          city: string
          created_at: string
          id: string
          language: string
          lat: number
          lon: number
          name: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          city: string
          created_at?: string
          id?: string
          language?: string
          lat: number
          lon: number
          name?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          city?: string
          created_at?: string
          id?: string
          language?: string
          lat?: number
          lon?: number
          name?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
