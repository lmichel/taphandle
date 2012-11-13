package metabase;

import java.util.Set;

import resources.RootClass;

public class RegistryExplorer extends RootClass {
	public static final boolean isInit;
	public static final String[] registryServers = {
		""
	};
	
	static {
		isInit = false;
	}
	
	public static Set<String> getDeclaredTapNodes() {
		return null;
	}
	public static String getDeclaredTapNodeDescription(String url) {
		return null;
	}
	public static Set<String> getDeclaredObsTapNodes() {
		return null;
	}

}
