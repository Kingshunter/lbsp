package com.lbsp.promotion.entity.query;

public class SortCond {
	/**
	 * 排序类型枚举
	 */
	public enum Order {
		ASC, DESC
	}

	/**
	 * 排序列
	 */
	private String column;

	/**
	 * 排序类型
	 */
	private Order order;

	public SortCond(String column) {
		this(column, Order.DESC);
	}

	public SortCond(String column, Order order) {
		this.column = column;
		this.order = order;
	}

	public String getColumn() {
		return column;
	}

	public Order getOrder() {
		return order;
	}
}
